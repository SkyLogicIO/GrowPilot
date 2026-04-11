"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Header from "@/components/header/Header";
import CreateTeamModal from "@/components/shell/CreateTeamModal";
import DashboardSidebar from "@/components/shell/DashboardSidebar";
import Login from "@/components/Login";
import GuestOverlay from "@/components/GuestOverlay";

// ─── 登录态外部存储（localStorage） ──────────────────────────────

const AUTH_STORAGE_KEY = "gp_token";
const AUTH_STORAGE_KEY_ALT = "access_token";

let authListeners: Array<() => void> = [];

function subscribeAuth(cb: () => void) {
  authListeners.push(cb);
  return () => {
    authListeners = authListeners.filter((l) => l !== cb);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return !!(
    localStorage.getItem(AUTH_STORAGE_KEY) ??
    localStorage.getItem(AUTH_STORAGE_KEY_ALT)
  );
}

function getServerSnapshot() {
  return false;
}

function emitAuthChange() {
  for (const cb of authListeners) cb();
}

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // 外部 store 感知登录态：初始值 false（SSR 安全），客户端 mount 后自动读 localStorage
  const storeAuthed = useSyncExternalStore(subscribeAuth, getSnapshot, getServerSnapshot);

  // 本地 state：null=检测中, false=未登录, true=已登录
  // 首帧 SSR/水合阶段 authed=null → 不渲染遮罩 → 避免 hydration mismatch
  const [authed, setAuthed] = useState<boolean | null>(null);

  // store 值变化时同步到本地 state
  useEffect(() => {
    setAuthed(storeAuthed);
  }, [storeAuthed]);

  // 监听登录成功事件
  useEffect(() => {
    const handleLogin = () => {
      emitAuthChange(); // 通知 useSyncExternalStore 刷新
      setAuthed(true);
      setIsLoginOpen(false);
    };
    window.addEventListener("growpilot:login", handleLogin);
    return () => window.removeEventListener("growpilot:login", handleLogin);
  }, []);

  // 监听登出事件
  useEffect(() => {
    const handleLogout = () => {
      emitAuthChange();
      setAuthed(false);
      setIsLoginOpen(false);
    };
    window.addEventListener("growpilot:logout", handleLogout);
    return () => window.removeEventListener("growpilot:logout", handleLogout);
  }, []);

  // 监听 Token 失效事件（API 401）
  useEffect(() => {
    const showLogin = () => {
      emitAuthChange();
      setAuthed(false);
      setIsLoginOpen(true);
    };
    window.addEventListener("growpilot:unauthorized", showLogin);
    return () => window.removeEventListener("growpilot:unauthorized", showLogin);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      <DashboardSidebar isOpen={isSidebarOpen} />

      <main
        className={`flex-1 flex flex-col min-h-screen transition-all duration-(--duration-medium) ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <Header
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
        />

        <div className="flex-1 p-8 overflow-y-auto relative">
          {children}
        </div>
      </main>

      {authed === false && (
        <GuestOverlay onOpenLogin={() => setIsLoginOpen(true)} />
      )}

      <CreateTeamModal isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />

      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          emitAuthChange();
          setIsLoginOpen(false);
          setAuthed(true);
        }}
      />
    </div>
  );
}
