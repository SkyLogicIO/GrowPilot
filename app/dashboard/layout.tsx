"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import CreateTeamModal from "@/components/shell/CreateTeamModal";
import DashboardSidebar from "@/components/shell/DashboardSidebar";
import Login from "@/components/Login";
import GuestOverlay from "@/components/GuestOverlay";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  // 初始化时检查登录态
  useEffect(() => {
    const token =
      localStorage.getItem("gp_token") ??
      localStorage.getItem("access_token");
    if (token) {
      setAuthed(true);
    }
  }, []);

  // 监听登录成功事件
  useEffect(() => {
    const handleLogin = () => {
      setAuthed(true);
      setIsLoginOpen(false);
    };
    window.addEventListener("growpilot:login", handleLogin);
    return () => window.removeEventListener("growpilot:login", handleLogin);
  }, []);

  // 监听登出事件
  useEffect(() => {
    const handleLogout = () => {
      setAuthed(false);
      setIsLoginOpen(false);
    };
    window.addEventListener("growpilot:logout", handleLogout);
    return () => window.removeEventListener("growpilot:logout", handleLogout);
  }, []);

  // 监听 Token 失效事件（API 401）
  useEffect(() => {
    const showLogin = () => {
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

      {!authed && (
        <GuestOverlay onOpenLogin={() => setIsLoginOpen(true)} />
      )}

      <CreateTeamModal isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />

      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsLoginOpen(false);
          setAuthed(true);
        }}
      />
    </div>
  );
}
