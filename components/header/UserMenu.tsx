"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HardDrive, Info, Lock, LogOut, Mail, User, Users, X, Zap } from "lucide-react";

const STORAGE_KEY = "growpilot_user_profile";

interface Transaction {
  id: string;
  at: string;
  type: string;
  amount: number;
  title: string;
  detail: string;
}

interface UserProfile {
  name: string;
  membership: string;
  points: number;
  userId: string;
  storageTotalGb: number;
  storageUsedGb: number;
  storageRatePointsPerGb: number;
  transactions: Transaction[];
  onboarding: unknown;
}

const safeJsonParse = (value: string | null): Record<string, unknown> | null => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const buildUserId = () => {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase();
  return `GP-${ts}-${rand}`;
};

const formatDateTime = (value: string) => {
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return String(value ?? "");
  }
};

const buildDemoTransactions = (): Transaction[] => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: `tx_${now}_1`,
      at: new Date(now - 1 * day).toISOString(),
      type: "充值",
      amount: 500,
      title: "积分充值",
      detail: "充值套餐：500 积分",
    },
    {
      id: `tx_${now}_2`,
      at: new Date(now - 6 * day).toISOString(),
      type: "扣款",
      amount: -130,
      title: "存储空间月度扣费",
      detail: "按占用空间扣费",
    },
    {
      id: `tx_${now}_3`,
      at: new Date(now - 8 * day).toISOString(),
      type: "扣款",
      amount: -20,
      title: "会员下载",
      detail: "下载素材消耗积分",
    },
    {
      id: `tx_${now}_4`,
      at: new Date(now - 12 * day).toISOString(),
      type: "充值",
      amount: 1000,
      title: "积分充值",
      detail: "充值套餐：1000 积分",
    },
    {
      id: `tx_${now}_5`,
      at: new Date(now - 16 * day).toISOString(),
      type: "扣款",
      amount: -45,
      title: "使用模型",
      detail: "调用模型消耗积分",
    },
    {
      id: `tx_${now}_6`,
      at: new Date(now - 20 * day).toISOString(),
      type: "扣款",
      amount: -15,
      title: "一键同款",
      detail: "生成任务消耗积分",
    },
    {
      id: `tx_${now}_7`,
      at: new Date(now - 24 * day).toISOString(),
      type: "充值",
      amount: 300,
      title: "积分充值",
      detail: "充值套餐：300 积分",
    },
  ];
};

interface UserMenuProps {
  onOpenCreateTeam: () => void;
}

export default function UserMenu({ onOpenCreateTeam }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Anna Hua",
    membership: "高级会员",
    points: 1280,
    userId: "GP-********",
    storageTotalGb: 50,
    storageUsedGb: 12.8,
    storageRatePointsPerGb: 10,
    transactions: [],
    onboarding: null,
  });
  const [geminiKey, setGeminiKey] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setGeminiKey(window.localStorage.getItem("gemini_api_key") || "");
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setGeminiKey(val);
    window.localStorage.setItem("gemini_api_key", val);
  };

  useEffect(() => {
    if (!mounted) return;
    const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEY));
    const userId = (saved?.userId as string) ?? buildUserId();
    const points = typeof saved?.points === "number" ? saved.points : 1280;
    const storageTotalGb = typeof saved?.storageTotalGb === "number" ? saved.storageTotalGb : 50;
    const storageUsedGb = typeof saved?.storageUsedGb === "number" ? saved.storageUsedGb : 12.8;
    const storageRatePointsPerGb = typeof saved?.storageRatePointsPerGb === "number" ? saved.storageRatePointsPerGb : 10;
    const transactions = Array.isArray(saved?.transactions) ? (saved.transactions as Transaction[]) : buildDemoTransactions();
    const next: UserProfile = {
      name: (saved?.name as string) ?? "Anna Hua",
      membership: (saved?.membership as string) ?? "高级会员",
      points,
      userId,
      storageTotalGb,
      storageUsedGb,
      storageRatePointsPerGb,
      transactions,
      onboarding: saved?.onboarding ?? null,
    };
    setProfile(next);
    if (
      !saved ||
      saved.userId !== userId ||
      saved.points !== points ||
      saved.storageTotalGb !== storageTotalGb ||
      saved.storageUsedGb !== storageUsedGb ||
      saved.storageRatePointsPerGb !== storageRatePointsPerGb ||
      !Array.isArray(saved?.transactions)
    ) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...saved,
          ...next,
          updatedAt: new Date().toISOString(),
        })
      );
    }
  }, [mounted, isProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen) return;
    setTxPage(1);
  }, [isProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen && !isAboutOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isAboutOpen) setIsAboutOpen(false);
      else if (isProfileOpen) setIsProfileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isProfileOpen, isAboutOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
    setIsAboutOpen(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("growpilot_user");
    } catch {}
    window.dispatchEvent(new CustomEvent("growpilot:logout"));
  };

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      setIsOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  return (
    <div className="flex items-center gap-3 pl-6 border-l border-white/10 relative" ref={ref}>
      <div className="text-right hidden md:block">
        <div className="text-sm font-medium text-white">{profile.name}</div>
        <div className="text-xs text-gray-500">{profile.membership}</div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center border border-white/10 hover:border-white/20 hover:bg-gray-600 transition-colors"
      >
        <User size={18} className="text-gray-200" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsProfileOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-200 hover:bg-white/5 transition-colors"
          >
            <User size={18} className="text-gray-300" />
            <span>我的资料</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenCreateTeam?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-200 hover:bg-white/5 transition-colors"
          >
            <Users size={18} className="text-gray-300" />
            <span>创建团队</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-200 hover:bg-white/5 transition-colors"
          >
            <Mail size={18} className="text-gray-300" />
            <span>联系我们</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsAboutOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-200 hover:bg-white/5 transition-colors"
          >
            <Info size={18} className="text-gray-300" />
            <span>关于我们</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-200 hover:bg-white/5 transition-colors"
          >
            <Lock size={18} className="text-gray-300" />
            <span>修改密码</span>
          </button>

          <div className="h-px bg-white/10" />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-gray-200 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-gray-300" />
              <span>锁定屏幕</span>
            </div>
            <span className="text-xs text-gray-500">⌥ L</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-gray-200 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-gray-300" />
              <span>退出登录</span>
            </div>
            <span className="text-xs text-gray-500">⌥ Q</span>
          </button>
        </div>
      )}

      {mounted && isProfileOpen
        ? createPortal(
            <div
              className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              style={{ zIndex: 99999, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setIsProfileOpen(false);
              }}
            >
              <div className="w-full max-w-xl bg-[#0F1115] rounded-2xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-lg font-extrabold text-white">我的资料</div>
                    <div className="mt-1 text-sm text-gray-400 truncate">{profile.name} · {profile.membership}</div>
                    <div className="mt-1 text-xs text-gray-500 truncate">ID：{profile.userId}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
                    aria-label="关闭"
                  >
                    <X size={18} className="text-gray-200" />
                  </button>
                </div>

                <div className="px-6 py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-gray-400">积分</div>
                        <button
                          type="button"
                          className="h-8 px-3 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-200 text-xs font-semibold hover:bg-blue-600/25 transition-colors"
                        >
                          充值
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Zap size={18} className="text-blue-300" />
                        <div className="text-2xl font-extrabold text-white">{profile.points}</div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-gray-400">存储空间</div>
                        <button
                          type="button"
                          className="h-8 px-3 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-200 text-xs font-semibold hover:bg-blue-600/25 transition-colors"
                        >
                          充值
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <HardDrive size={18} className="text-gray-300" />
                        <div className="text-base font-extrabold text-white">
                          {Number(profile.storageUsedGb).toFixed(1)}GB / {profile.storageTotalGb}GB
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        每月按占用空间扣积分（{profile.storageRatePointsPerGb} 积分/GB）：{Math.ceil(profile.storageUsedGb) * profile.storageRatePointsPerGb} 积分/月
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold text-white">充值与消耗记录</div>
                      <div className="text-xs text-gray-400">共 {profile.transactions.length} 条</div>
                    </div>

                    <div className="mt-3 rounded-xl border border-white/10 overflow-hidden">
                      <div className="grid grid-cols-[128px_64px_88px_minmax(0,1fr)] gap-3 px-3 py-2 bg-black/30 text-xs text-gray-400">
                        <div>时间</div>
                        <div>类型</div>
                        <div className="text-right">积分</div>
                        <div>详情</div>
                      </div>

                      {(() => {
                        const pageSize = 6;
                        const totalPages = Math.max(1, Math.ceil(profile.transactions.length / pageSize));
                        const currentPage = Math.min(Math.max(1, txPage), totalPages);
                        const start = (currentPage - 1) * pageSize;
                        const rows = profile.transactions.slice(start, start + pageSize);

                        return (
                          <div className="divide-y divide-white/10">
                            {rows.map((tx) => {
                              const amount = Number(tx.amount) || 0;
                              const isIn = amount > 0;
                              return (
                                <div
                                  key={tx.id}
                                  className="grid grid-cols-[128px_64px_88px_minmax(0,1fr)] gap-3 px-3 py-2 text-sm"
                                >
                                  <div className="text-gray-300">{formatDateTime(tx.at)}</div>
                                  <div className={isIn ? "text-emerald-300" : "text-rose-300"}>
                                    {tx.type || (isIn ? "充值" : "扣款")}
                                  </div>
                                  <div className={isIn ? "text-emerald-200 text-right font-semibold" : "text-rose-200 text-right font-semibold"}>
                                    {isIn ? `+${amount}` : `${amount}`}
                                  </div>
                                  <div className="text-gray-200 truncate">
                                    <span className="font-semibold text-white/90">{tx.title || "-"}</span>
                                    {tx.detail ? <span className="text-gray-400"> · {tx.detail}</span> : null}
                                  </div>
                                </div>
                              );
                            })}

                            {rows.length === 0 ? (
                              <div className="px-3 py-6 text-sm text-gray-400 text-center">暂无记录</div>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>

                    {(() => {
                      const pageSize = 6;
                      const totalPages = Math.max(1, Math.ceil(profile.transactions.length / pageSize));
                      const currentPage = Math.min(Math.max(1, txPage), totalPages);
                      const canPrev = currentPage > 1;
                      const canNext = currentPage < totalPages;

                      return (
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-xs text-gray-400">
                            第 {currentPage} / {totalPages} 页
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={!canPrev}
                              onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                              className="h-9 px-4 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-40 disabled:hover:bg-white/5"
                            >
                              上一页
                            </button>
                            <button
                              type="button"
                              disabled={!canNext}
                              onClick={() => setTxPage((p) => p + 1)}
                              className="h-9 px-4 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-40 disabled:hover:bg-white/5"
                            >
                              下一页
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="px-6 py-5 border-t border-white/10 flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={geminiKey}
                      onChange={handleKeyChange}
                      placeholder="输入 Gemini API Key"
                      className="w-full h-11 px-4 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="h-11 px-6 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors font-semibold shrink-0"
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {mounted && isAboutOpen
        ? createPortal(
            <div
              className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              style={{ zIndex: 99999, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setIsAboutOpen(false);
              }}
            >
              <div className="w-full max-w-xl bg-[#0F1115] rounded-2xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-lg font-extrabold text-white">关于我们</div>
                    <div className="mt-1 text-sm text-gray-400 truncate">GrowPilot · 让数字 AI 成就增长</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAboutOpen(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
                    aria-label="关闭"
                  >
                    <X size={18} className="text-gray-200" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300 leading-relaxed">
                    GrowPilot 面向内容与增长团队，提供从灵感发现、模型与素材复用到产出管理的一体化工作流。
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-gray-400">当前版本</div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {process.env.NEXT_PUBLIC_APP_VERSION ?? "2.0.0"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-gray-400">联系邮箱</div>
                      <div className="mt-1 text-sm font-semibold text-white break-all">support@growpilot.ai</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="text-gray-400">提示</div>
                    <div className="mt-1 text-gray-200">按 ESC 可关闭弹窗。</div>
                  </div>
                </div>

                <div className="px-6 py-5 border-t border-white/10 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAboutOpen(false)}
                    className="h-11 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors font-semibold"
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
