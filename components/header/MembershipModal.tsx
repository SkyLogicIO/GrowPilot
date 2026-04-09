"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Minus } from "lucide-react";

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PlanKey = "free" | "fuel" | "monthly" | "annual";

type FeatureRow = {
  label: string;
  values: Record<PlanKey, string | boolean>;
};

const PLANS: {
  key: PlanKey;
  name: string;
  desc?: string;
  price?: string;
  bonus?: string;
  validity?: string;
  realPrice?: string;
  discountBadge?: { text: string; color: string };
  cta: string;
  ctaStyle: string;
}[] = [
  {
    key: "free",
    name: "免费版",
    desc: "新用户体验，0成本试水",
    cta: "当前方案",
    ctaStyle: "bg-white/[0.05] border border-white/[0.08] text-text-muted cursor-default",
  },
  {
    key: "fuel",
    name: "只买加油包",
    price: "199 元/个",
    bonus: "赠 19,900 积分",
    validity: "永久有效",
    cta: "立即购买（199元，无折扣）",
    ctaStyle: "bg-white/[0.08] border border-white/[0.12] text-text-primary hover:bg-white/[0.12]",
  },
  {
    key: "monthly",
    name: "月卡会员",
    desc: "专业卖家，当月积分立即到账",
    price: "449 元/月",
    bonus: "赠 44,900 积分",
    realPrice: "399元",
    discountBadge: { text: "89折", color: "bg-accent text-white" },
    cta: "立即购买（399元，89折优惠）",
    ctaStyle: "bg-accent text-white hover:bg-accent-light shadow-lg shadow-accent/30",
  },
  {
    key: "annual",
    name: "年卡会员",
    desc: "超值年付，当月积分立即到账",
    price: "5,388 元/年",
    bonus: "赠 538,800 积分",
    realPrice: "2,999元",
    discountBadge: { text: "53折", color: "bg-gradient-to-r from-orange-500 to-rose-500 text-white" },
    cta: "立即购买（2,999元，53折优惠）",
    ctaStyle: "bg-accent text-white hover:bg-accent-light shadow-lg shadow-accent/30 animate-glow",
  },
];

const FEATURES: FeatureRow[] = [
  { label: "图片下载", values: { free: "图片下载",   fuel: "带水印下载",   monthly: "无水印下载", annual: "无水印下载" } },
  { label: "同时生成", values: { free: "3个任务",     fuel: "3个任务",     monthly: "6个任务",    annual: "6个任务" } },
  { label: "批量生图", values: { free: false,         fuel: false,         monthly: false,        annual: true } },
  { label: "投前检测", values: { free: false,         fuel: false,         monthly: false,        annual: true } },
  { label: "专项策略", values: { free: false,         fuel: false,         monthly: false,        annual: true } },
  { label: "视频生成", values: { free: "1个任务",     fuel: "3个任务",     monthly: "3个任务",    annual: "6个任务" } },
];

export default function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activePlan, setActivePlan] = useState<PlanKey>("annual");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const renderCellValue = (value: string | boolean, planKey: PlanKey, featureLabel: string) => {
    if (value === false) return <Minus size={14} className="text-white/20" />;
    if (value === true) return <Check size={14} className="text-accent-bright" />;
    const freeVal = FEATURES.find(f => f.label === featureLabel)?.values.free;
    const upgraded = planKey !== "free" && value !== freeVal;
    return (
      <span className={`text-sm font-bold ${upgraded ? "text-accent-bright" : "text-text-secondary"}`}>
        {value as string}
      </span>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ zIndex: 99999 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl mx-4 bg-[#030710] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 animate-fade-up">
        {/* ── Header ── */}
        <div className="px-8 pt-7 pb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-text-primary">会员详细权益对比</h2>
            <p className="mt-1.5 text-sm text-text-muted">
              积分当月到账 · 年付享最低折扣
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors shrink-0"
            aria-label="关闭"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>

        <div className="px-8 pb-8">
          {/* ── Plan Cards ── */}
          <div className="grid grid-cols-4 gap-3">
            {PLANS.map((plan) => {
              const isActive = activePlan === plan.key;
              const isAnnual = plan.key === "annual";
              return (
                <div
                  key={plan.key}
                  onClick={() => setActivePlan(plan.key)}
                  className={`relative cursor-pointer rounded-xl p-4 transition-all duration-150 text-center ${
                    isActive
                      ? isAnnual
                        ? "bg-accent/[0.08] border-2 border-accent/40"
                        : "bg-accent/[0.08] border-2 border-accent/40"
                      : "bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  {plan.discountBadge && (
                    <span className={`absolute -top-2.5 -right-2 text-[0.65rem] font-black px-2 py-0.5 rounded-full z-10 ${plan.discountBadge.color}`}>
                      {plan.discountBadge.text}
                    </span>
                  )}
                  <div className="text-sm font-black text-text-primary">{plan.name}</div>
                  {plan.desc && <div className="mt-1 text-[0.7rem] text-text-muted leading-relaxed">{plan.desc}</div>}
                  {plan.price && (
                    <div className="mt-2.5">
                      <span className="text-base font-black text-text-primary">{plan.price}</span>
                    </div>
                  )}
                  {plan.bonus && <div className="mt-1 text-xs font-bold text-accent-bright">{plan.bonus}</div>}
                  {plan.validity && <div className="mt-0.5 text-[0.7rem] text-text-muted">{plan.validity}</div>}
                </div>
              );
            })}
          </div>

          {/* ── Feature Table ── */}
          <div className="mt-5 rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="grid grid-cols-[100px_repeat(4,1fr)]">
              {/* Header row */}
              <div className="px-4 py-2.5 border-b border-white/[0.06]" />
              {PLANS.map((plan) => (
                <div key={plan.key} className="px-2 py-2.5 border-b border-white/[0.06] text-center text-xs font-bold text-text-muted">
                  {plan.name}
                </div>
              ))}

              {/* Feature rows */}
              {FEATURES.map((feature, idx) => (
                <>
                  <div
                    key={`label-${feature.label}`}
                    className={`px-4 py-3 text-xs font-bold text-text-muted flex items-center ${
                      idx < FEATURES.length - 1 ? "border-b border-white/[0.04]" : ""
                    }`}
                  >
                    {feature.label}
                  </div>
                  {PLANS.map((plan) => (
                    <div
                      key={`${feature.label}-${plan.key}`}
                      className={`px-2 py-3 flex items-center justify-center ${
                        idx < FEATURES.length - 1 ? "border-b border-white/[0.04]" : ""
                      }`}
                    >
                      {renderCellValue(feature.values[plan.key], plan.key, feature.label)}
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className={`h-12 px-10 rounded-xl font-bold text-sm border border-transparent transition-colors ${
                PLANS.find(p => p.key === activePlan)?.ctaStyle
              }`}
            >
              {PLANS.find(p => p.key === activePlan)?.cta}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
