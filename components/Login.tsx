"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, Mail, Phone, User, UserPlus, X } from "lucide-react";
import { login, register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";

type Mode = "login" | "register";

const USER_TYPE_LABEL: Record<number, string> = {
  1: "普通会员",
  2: "VIP会员",
  3: "企业会员",
};

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function persistAuthData(user: AuthUser, token: string) {
  localStorage.setItem("access_token", token);
  localStorage.setItem(
    "growpilot_user",
    JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
      credits: user.credits,
    }),
  );

  // 部分更新 growpilot_user_profile，保留 demo 的 storage/transactions
  const prev = (() => {
    try {
      return JSON.parse(localStorage.getItem("growpilot_user_profile") || "{}");
    } catch {
      return {};
    }
  })();
  localStorage.setItem(
    "growpilot_user_profile",
    JSON.stringify({
      ...prev,
      name: user.username,
      membership: USER_TYPE_LABEL[user.user_type] || "普通会员",
      points: user.credits,
    }),
  );

  window.dispatchEvent(
    new CustomEvent("growpilot:login", {
      detail: { user },
    }),
  );
}

export default function Login({ isOpen, onClose, onSuccess }: LoginProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // 切换 mode 时清除错误
  useEffect(() => {
    setError("");
  }, [mode]);

  const handleLoginSuccess = () => {
    onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (mode === "register" && !agreeTerms) {
      setError("请先同意服务条款和隐私政策");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === "register") {
        if (!username.trim() || !email.trim() || !password.trim()) {
          throw new ApiError(-1, "请填写所有必填项");
        }
        res = await register({
          username: username.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        });
      } else {
        if (!username.trim() || !password.trim()) {
          throw new ApiError(-1, "请填写用户名和密码");
        }
        res = await login({
          username: username.trim(),
          password,
        });
      }
      persistAuthData(res.user, res.access_token);
      handleLoginSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("网络连接失败，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4 md:p-8"
      style={{ zIndex: 99999 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-fade-up relative w-[min(806px,95vw)] overflow-hidden brut-card-static">
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 max-h-[calc(100svh-2rem)] md:max-h-[calc(100svh-4rem)]">
          {/* 左侧品牌区 */}
          <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden rounded-tl-[10px] rounded-bl-[10px]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-85"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop)",
              }}
            />
            <div className="absolute top-6 right-6 w-16 h-16 bg-yellow border-2 border-border rounded-lg shadow-[3px_3px_0px_#1A1A1A] opacity-80" />
            <div className="absolute bottom-12 left-6 w-12 h-12 bg-teal border-2 border-border rounded-lg shadow-[3px_3px_0px_#1A1A1A] opacity-80" />
            <div className="absolute top-1/3 left-8 w-8 h-8 bg-accent border-2 border-border rounded-md shadow-[2px_2px_0px_#1A1A1A] opacity-60" />
            <div className="relative text-sm text-white font-bold tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
              Build Growth Once, Scale Everywhere
            </div>
            <div className="relative" />
          </div>

          {/* 右侧表单区 */}
          <div className="min-h-0 overflow-y-auto p-6 md:p-10 bg-surface">
            {/* 标题 */}
            <div className="mb-4">
              <div className="text-2xl md:text-3xl font-black text-text-primary">
                {mode === "login" ? "欢迎回来 GrowPilot" : "加入 GrowPilot"}
              </div>
              <div className="mt-2 text-sm text-text-secondary font-medium">
                {mode === "login" ? (
                  <>
                    使用用户名和密码登录，或
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-accent underline decoration-2 underline-offset-4 font-bold hover:text-accent-hover transition-colors ml-1 cursor-pointer"
                    >
                      创建新账号
                    </button>
                  </>
                ) : (
                  <>
                    已有账号？
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-accent underline decoration-2 underline-offset-4 font-bold hover:text-accent-hover transition-colors ml-1 cursor-pointer"
                    >
                      立即登录
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tab 切换 */}
            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`px-4 py-1.5 text-sm font-bold rounded-lg border-2 border-border transition-all ${
                  mode === "login"
                    ? "bg-accent text-white shadow-[2px_2px_0px_#1A1A1A]"
                    : "bg-surface text-text-secondary hover:bg-surface-hover shadow-[2px_2px_0px_#1A1A1A]"
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`px-4 py-1.5 text-sm font-bold rounded-lg border-2 border-border transition-all ${
                  mode === "register"
                    ? "bg-accent text-white shadow-[2px_2px_0px_#1A1A1A]"
                    : "bg-surface text-text-secondary hover:bg-surface-hover shadow-[2px_2px_0px_#1A1A1A]"
                }`}
              >
                注册
              </button>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border-2 border-error text-error text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-3">
                {/* 用户名 */}
                <div className="h-12 flex items-center gap-3 px-4 bg-background border-2 border-border rounded-xl transition-all focus-within:border-accent focus-within:shadow-[2px_2px_0px_#1A1A1A]">
                  <div className="text-text-secondary shrink-0">
                    {mode === "register" ? <UserPlus size={18} /> : <User size={18} />}
                  </div>
                  <input
                    type="text"
                    placeholder="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent text-text-primary placeholder-text-muted outline-none"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </div>

                {/* 邮箱（仅注册） */}
                {mode === "register" && (
                  <div className="h-12 flex items-center gap-3 px-4 bg-background border-2 border-border rounded-xl transition-all focus-within:border-accent focus-within:shadow-[2px_2px_0px_#1A1A1A]">
                    <div className="text-text-secondary shrink-0">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="邮箱地址"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-text-primary placeholder-text-muted outline-none"
                      required
                    />
                  </div>
                )}

                {/* 密码 */}
                <div className="h-12 flex items-center gap-3 px-4 bg-background border-2 border-border rounded-xl transition-all focus-within:border-accent focus-within:shadow-[2px_2px_0px_#1A1A1A]">
                  <div className="text-text-secondary shrink-0">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder={
                      mode === "register" ? "密码（至少 6 位）" : "密码"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-text-primary placeholder-text-muted outline-none"
                    required
                    minLength={mode === "register" ? 6 : undefined}
                  />
                </div>

                {/* 手机号（仅注册，可选） */}
                {mode === "register" && (
                  <div className="h-12 flex items-center gap-3 px-4 bg-background border-2 border-border rounded-xl transition-all focus-within:border-accent focus-within:shadow-[2px_2px_0px_#1A1A1A]">
                    <div className="text-text-secondary shrink-0">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      placeholder="手机号（选填）"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent text-text-primary placeholder-text-muted outline-none"
                      maxLength={20}
                    />
                  </div>
                )}
              </div>

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="brut-btn mt-5 w-full h-12 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "处理中..."
                  : mode === "login"
                    ? "登录"
                    : "注册并登录"}
              </button>

              {/* 同意条款（仅注册时显示） */}
              {mode === "register" && (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-2 border-border bg-background accent-accent shrink-0"
                />
                <label
                  htmlFor="agree"
                  className="text-sm text-text-secondary leading-none"
                >
                  我已阅读并同意{" "}
                  <span className="text-accent cursor-pointer hover:underline font-bold">
                    服务条款
                  </span>{" "}
                  和{" "}
                  <span className="text-accent cursor-pointer hover:underline font-bold">
                    隐私政策
                  </span>
                </label>
              </div>
              )}

              {/* 分隔线 */}
              <div className="mt-5 relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-surface text-text-muted text-sm">
                    或使用第三方登录
                  </span>
                </div>
              </div>

              {/* 第三方登录 */}
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="flex-1 h-12 flex items-center justify-center gap-3 bg-surface border-2 border-border text-text-primary rounded-[10px] shadow-[2px_2px_0px_#1A1A1A] hover:bg-surface-hover transition-all font-bold"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    style={{ minWidth: "18px", minHeight: "18px" }}
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  className="flex-1 h-12 flex items-center justify-center gap-3 bg-surface border-2 border-border text-text-primary rounded-[10px] shadow-[2px_2px_0px_#1A1A1A] hover:bg-surface-hover transition-all font-bold"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 23 23"
                    style={{ minWidth: "18px", minHeight: "18px" }}
                  >
                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
