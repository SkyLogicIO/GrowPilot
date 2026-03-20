"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Building2,
  UtensilsCrossed,
  GraduationCap,
  Home,
  Shield,
  Calculator,
  Sparkles,
  Facebook,
  BookOpen,
  Video,
  Search,
  TrendingUp,
  Users,
  Store,
  Target,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const INDUSTRIES = [
  "餐饮", "教育", "房产 Agent", "保险 Agent", 
  "财务/CPA税务筹划", "个人品牌"
];

const PLATFORMS = [
  "Meta", "小红书", "视频号", "Google"
];

const GOALS = [
  "上市", "粉丝增长", "扩张门店", "稳定获客", "招人/招代理"
];

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "餐饮": UtensilsCrossed,
  "教育": GraduationCap,
  "房产 Agent": Home,
  "保险 Agent": Shield,
  "财务/CPA税务筹划": Calculator,
  "个人品牌": Sparkles,
};

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  Meta: Facebook,
  "小红书": BookOpen,
  "视频号": Video,
  Google: Search,
};

const GOAL_ICONS: Record<string, LucideIcon> = {
  "上市": TrendingUp,
  "粉丝增长": Users,
  "扩张门店": Store,
  "稳定获客": Target,
  "招人/招代理": UserPlus,
};

const STORAGE_KEY = "growpilot_user_profile";

const safeJsonParse = (value: string | null): any => {
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

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: "business", // business | individual
    industries: [] as string[],
    customIndustry: "",
    
    profile: {
      name: "",
      scale: "",
      product: ""
    },
    
    media: {
      platforms: [] as string[],
      hasContent: false,
      hasAds: false
    },
    
    goals: [] as string[]
  });

  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [stableHeight, setStableHeight] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (step !== 1) return;
    if (stableHeight !== null) return;

    const raf = requestAnimationFrame(() => {
      const el = modalRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      setStableHeight(Math.min(rect.height, window.innerHeight * 0.9));
    });

    return () => cancelAnimationFrame(raf);
  }, [isOpen, step, stableHeight]);

  useEffect(() => {
    if (stableHeight === null) return;

    const onResize = () => {
      setStableHeight((prev) => (prev === null ? null : Math.min(prev, window.innerHeight * 0.9)));
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [stableHeight]);

  if (!isOpen || !mounted) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    try {
      const existing = safeJsonParse(window.localStorage.getItem(STORAGE_KEY));
      const userId = existing?.userId ?? buildUserId();
      const points = typeof existing?.points === "number" ? existing.points : 1280;
      const nameFromForm = (formData.profile?.name ?? "").trim();
      const name = nameFromForm || existing?.name || "Anna Hua";
      const membership = existing?.membership || "高级会员";

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          userId,
          points,
          name,
          membership,
          onboarding: formData,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {}

    onComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSelection = (list: string[], item: string, field: string) => {
    const newList = list.includes(item)
      ? list.filter(i => i !== item)
      : [...list, item];
    
    if (field === "industries") setFormData({ ...formData, industries: newList });
    if (field === "platforms") setFormData({ ...formData, media: { ...formData.media, platforms: newList } });
    if (field === "goals") setFormData({ ...formData, goals: newList });
  };

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md"
      style={{ zIndex: 99999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[#0F1115] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10"
        style={{ height: stableHeight ? `${stableHeight}px` : undefined }}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-gray-800 w-full">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          {/* Step 1: 身份与行业 */}
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">欢迎加入 GrowPilot</h2>
                <p className="text-gray-400">首先，请告诉我们要为您打造什么样的增长引擎</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">您的身份是？</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, role: "business" })}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        formData.role === "business" 
                          ? "bg-blue-600/20 border-blue-500 text-white" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <Building2 size={24} />
                      <span className="font-medium">企业商家</span>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, role: "individual" })}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        formData.role === "individual" 
                          ? "bg-blue-600/20 border-blue-500 text-white" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <User size={24} />
                      <span className="font-medium">个人创作者</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">您所在的行业（可多选）</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {INDUSTRIES.map(ind => {
                      const Icon = INDUSTRY_ICONS[ind] ?? Building2;
                      return (
                      <button
                        key={ind}
                        onClick={() => toggleSelection(formData.industries, ind, "industries")}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all flex items-center gap-2 ${
                          formData.industries.includes(ind)
                            ? "bg-blue-600/20 border-blue-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <Icon size={16} className="shrink-0 opacity-90" />
                        <span className="leading-none">{ind}</span>
                      </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="其他行业（请输入）"
                    value={formData.customIndustry}
                    onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value })}
                    className="mt-3 w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 基础信息 */}
          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">完善基础档案</h2>
                <p className="text-gray-400">帮助 AI 更精准地理解您的业务规模</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">企业 / 个人名称</label>
                  <input
                    type="text"
                    value={formData.profile.name}
                    onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, name: e.target.value } })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    placeholder="请输入名称"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">规模（门店数 / 团队人数 / 流量数据）</label>
                  <input
                    type="text"
                    value={formData.profile.scale}
                    onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, scale: e.target.value } })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                    placeholder="例如：5家门店 / 20人团队"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">主打产品 / 服务</label>
                  <textarea
                    value={formData.profile.product}
                    onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, product: e.target.value } })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none h-24 resize-none"
                    placeholder="简要描述您的核心产品或服务"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 现有媒体情况 */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">现有媒体情况</h2>
                <p className="text-gray-400">了解您的数字化资产现状</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">已有平台（多选）</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS.map(platform => {
                      const Icon = PLATFORM_ICONS[platform] ?? Building2;
                      return (
                      <button
                        key={platform}
                        onClick={() => toggleSelection(formData.media.platforms, platform, "platforms")}
                        className={`px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                          formData.media.platforms.includes(platform)
                            ? "bg-blue-600/20 border-blue-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={18} className="shrink-0 opacity-90" />
                          <span className="leading-none">{platform}</span>
                        </div>
                        {formData.media.platforms.includes(platform) && <Check size={16} />}
                      </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white">是否有内容在发？</span>
                    <div className="flex bg-black/40 p-1 rounded-lg">
                      <button
                        onClick={() => setFormData({ ...formData, media: { ...formData.media, hasContent: true } })}
                        className={`px-4 py-1 rounded-md text-sm transition-all ${formData.media.hasContent ? "bg-blue-600 text-white" : "text-gray-400"}`}
                      >是</button>
                      <button
                        onClick={() => setFormData({ ...formData, media: { ...formData.media, hasContent: false } })}
                        className={`px-4 py-1 rounded-md text-sm transition-all ${!formData.media.hasContent ? "bg-gray-700 text-white" : "text-gray-400"}`}
                      >否</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white">是否做过投流？</span>
                    <div className="flex bg-black/40 p-1 rounded-lg">
                      <button
                        onClick={() => setFormData({ ...formData, media: { ...formData.media, hasAds: true } })}
                        className={`px-4 py-1 rounded-md text-sm transition-all ${formData.media.hasAds ? "bg-blue-600 text-white" : "text-gray-400"}`}
                      >是</button>
                      <button
                        onClick={() => setFormData({ ...formData, media: { ...formData.media, hasAds: false } })}
                        className={`px-4 py-1 rounded-md text-sm transition-all ${!formData.media.hasAds ? "bg-gray-700 text-white" : "text-gray-400"}`}
                      >否</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 目标设定 */}
          {step === 4 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">设定增长目标</h2>
                <p className="text-gray-400">这也是我们为您服务的终点</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-4 block">您的核心目标是（多选）</label>
                <div className="grid grid-cols-1 gap-3">
                  {GOALS.map(goal => {
                    const Icon = GOAL_ICONS[goal] ?? Target;
                    const selected = formData.goals.includes(goal);
                    return (
                    <button
                      key={goal}
                      onClick={() => toggleSelection(formData.goals, goal, "goals")}
                      className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between group ${
                        selected
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={selected ? "text-white" : "text-gray-400"} />
                        <span className="font-medium text-lg">{goal}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                        selected ? "bg-blue-500 border-blue-500" : "border-gray-600 group-hover:border-gray-400"
                      }`}>
                        {selected && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-white/10 bg-[#0F1115] flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${step === 1 ? "opacity-0 cursor-default" : ""}`}
          >
            <ChevronLeft size={20} />
            上一步
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            {step === 4 ? "开启数字AI助理" : "下一步"}
            {step !== 4 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
