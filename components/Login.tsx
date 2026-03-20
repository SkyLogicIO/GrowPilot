"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, User, X } from "lucide-react";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function Login({ isOpen, onClose, onSuccess }: LoginProps) {
  const [identifier, setIdentifier] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
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

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1000);
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-transparent overflow-y-auto flex items-center justify-center p-4 md:p-8"
      style={{ zIndex: 99999 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[min(806px,95vw)] overflow-hidden rounded-[32px] border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10">
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        <div className="grid md:grid-cols-2 max-h-[calc(100svh-2rem)] md:max-h-[calc(100svh-4rem)]">
          <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-85"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-black/30" />
            <div className="relative text-sm text-white tracking-wide">Build Growth Once, Scale Everywhere</div>
          </div>

          <div className="min-h-0 overflow-y-auto p-6 md:p-10 text-white">
            <div className="mb-6">
              <div className="text-2xl md:text-3xl font-bold text-white">欢迎回来GrowPilot</div>
              <div className="mt-2 text-sm text-gray-300 flex items-center gap-2">
                <span>使用手机号/邮箱继续登录 或</span>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSuccess();
                  }}
                  className="text-blue-500 underline decoration-2 underline-offset-4 font-semibold hover:text-blue-400 transition-colors cursor-pointer"
                  style={{ color: "#3B82F6" }}
                >
                  立即注册
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-3">
                <div className="h-12 flex items-center gap-3 px-4 bg-[#0B0E14] border border-white/10 rounded-2xl transition-all hover:border-white/20 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <div className="text-gray-400 shrink-0">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="手机号 / 邮箱"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
                    required
                  />
                </div>

                <div className="h-12 flex items-center gap-3 px-4 bg-[#0B0E14] border border-white/10 rounded-2xl transition-all hover:border-white/20 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <div className="text-gray-400 shrink-0">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="验证码 / 密码"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full h-12 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/15 hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "登录中..." : "登录"}
              </button>

              <div className="mt-5 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agree"
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <label htmlFor="agree" className="text-sm text-gray-400 leading-none">
                  我已阅读并同意 <span className="text-blue-400 cursor-pointer hover:underline">服务条款</span> 和 <span className="text-blue-400 cursor-pointer hover:underline">隐私政策</span>
                </label>
              </div>

              <div className="mt-5 relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[#0F1115] text-gray-500 text-sm">或使用第三方登录</span>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="flex-1 h-12 flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#3F3F3F] border border-gray-700 text-white rounded-2xl transition-all font-medium"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ minWidth: "18px", minHeight: "18px" }}>
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
                  className="flex-1 h-12 flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#3F3F3F] border border-gray-700 text-white rounded-2xl transition-all font-medium"
                >
                  <svg width="18" height="18" viewBox="0 0 23 23" style={{ minWidth: "18px", minHeight: "18px" }}>
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
    document.body
  );
}
