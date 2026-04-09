"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Gift, CheckCircle2, Clock, Link2, Hourglass, Sparkles } from "lucide-react";

// 领取状态：未激活 → 已领取 → 礼品已发放
type RewardStatus = "inactive" | "claimed" | "rewarded";

interface InviteLink {
  id: string;
  url: string;
  createdAt: number; // timestamp ms
  expiresAt: number; // createdAt + 48h
  used: boolean;
  usedAt?: number;
  rewardStatus: RewardStatus;
}

const EXPIRE_MS = 48 * 60 * 60 * 1000; // 48 小时
const STORAGE_KEY = "growpilot_invite_links";

function generateCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function buildUrl(code: string) {
  const base =
    typeof window !== "undefined" ? window.location.origin : "https://growpilot.ai";
  return `${base}/invite/${code}`;
}

function loadLinks(): InviteLink[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLinks(links: InviteLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "已过期";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteRewardModal({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    setLinks(loadLinks());
  }, []);

  // 每秒刷新倒计时
  useEffect(() => {
    if (!isOpen) return;
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  function handleGenerate() {
    const code = generateCode();
    const createdAt = Date.now();
    const newLink: InviteLink = {
      id: code,
      url: buildUrl(code),
      createdAt,
      expiresAt: createdAt + EXPIRE_MS,
      used: false,
      rewardStatus: "inactive",
    };
    const updated = [newLink, ...links];
    setLinks(updated);
    saveLinks(updated);
    // 自动复制新链接
    navigator.clipboard.writeText(newLink.url).catch(() => {});
    setCopiedId(newLink.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleCopy(link: InviteLink) {
    navigator.clipboard.writeText(link.url).catch(() => {});
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const activeCount = links.filter(l => !l.used && l.expiresAt > now).length;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ zIndex: 99999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg mx-4 bg-[#030710] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 animate-fade-up flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose/15 border border-rose/30 flex items-center justify-center">
              <Gift size={20} className="text-rose" />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-primary">邀请有礼</h2>
              <p className="text-xs text-text-muted mt-0.5">每个链接 48 小时内有效，可多次生成</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors shrink-0"
            aria-label="关闭"
          >
            <X size={15} className="text-text-muted" />
          </button>
        </div>

        {/* 生成按钮区 */}
        <div className="px-6 pb-4 shrink-0">
          <button
            type="button"
            onClick={handleGenerate}
            className="brut-btn-primary w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <Link2 size={16} />
            生成新邀请链接
          </button>
          {activeCount > 0 && (
            <p className="mt-2 text-center text-xs text-text-muted">
              当前有 <span className="text-accent font-bold">{activeCount}</span> 个有效链接
            </p>
          )}
        </div>

        {/* 链接列表 */}
        <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
          {links.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-text-muted">
              <Link2 size={32} className="opacity-20" />
              <p className="text-sm">还没有生成过邀请链接</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const expired = link.expiresAt <= now;
                const remaining = link.expiresAt - now;
                const isCopied = copiedId === link.id;

                // 倒计时状态
                let timerLabel: React.ReactNode;
                let timerColor: string;
                if (link.used) {
                  timerLabel = <><CheckCircle2 size={11} className="shrink-0" />已使用</>;
                  timerColor = "text-green";
                } else if (expired) {
                  timerLabel = <><Clock size={11} className="shrink-0" />已过期</>;
                  timerColor = "text-text-muted";
                } else {
                  timerLabel = <><Clock size={11} className="shrink-0" /><span className="font-mono">{formatCountdown(remaining)}</span></>;
                  timerColor = "text-accent";
                }

                // 领取/礼品状态
                const rs = link.rewardStatus ?? "inactive";
                const rewardCfg: Record<RewardStatus, { label: string; icon: React.ReactNode; cls: string }> = {
                  inactive:  { label: "未激活", icon: <Hourglass size={11} className="shrink-0" />,   cls: "bg-white/[0.06] text-text-muted border-white/[0.08]" },
                  claimed:   { label: "已领取", icon: <CheckCircle2 size={11} className="shrink-0" />, cls: "bg-accent/15 text-accent border-accent/25" },
                  rewarded:  { label: "已完成", icon: <Sparkles size={11} className="shrink-0" />,     cls: "bg-green/15 text-green border-green/25" },
                };
                const rc = rewardCfg[rs];

                return (
                  <div
                    key={link.id}
                    className={`rounded-xl border px-4 py-3 transition-colors ${
                      link.used || expired
                        ? "bg-white/[0.02] border-white/[0.05] opacity-60"
                        : "bg-accent/8 border-accent/20"
                    }`}
                  >
                    {/* URL + 倒计时 */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary font-mono truncate">{link.url}</p>
                        <div className={`mt-1 flex items-center gap-1 text-[0.65rem] font-bold ${timerColor}`}>
                          {timerLabel}
                        </div>
                      </div>

                      {/* 领取状态徽章 */}
                      <span className={`shrink-0 flex items-center gap-1 px-2.5 h-7 rounded-lg text-[0.65rem] font-bold border ${rc.cls}`}>
                        {rc.icon}{rc.label}
                      </span>

                      {/* 复制按钮 */}
                      {!link.used && !expired && (
                        <button
                          type="button"
                          onClick={() => handleCopy(link)}
                          className={`shrink-0 flex items-center gap-1.5 px-3 h-7 rounded-lg text-xs font-bold transition-colors ${
                            isCopied
                              ? "bg-green/20 text-green border border-green/30"
                              : "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30"
                          }`}
                        >
                          {isCopied ? <><CheckCircle2 size={12} />已复制</> : <><Copy size={12} />复制</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
