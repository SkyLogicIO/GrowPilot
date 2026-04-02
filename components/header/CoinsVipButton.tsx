import { Diamond, Zap } from "lucide-react";

export default function CoinsVipButton() {
  return (
    <button
      type="button"
      className="h-10 px-4 rounded-full bg-surface-hover border-2 border-border text-text-primary hover:bg-[#f0efea] transition-colors flex items-center gap-3 shadow-[2px_2px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A]"
    >
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-[#FFD93D]" />
        <span className="text-sm font-bold text-text-primary">20</span>
        <span className="text-sm font-bold text-text-secondary">充值</span>
      </div>
      <span className="w-px h-5 bg-border" />
      <div className="flex items-center gap-2">
        <Diamond size={18} className="text-[#C77DFF]" />
        <span className="text-sm font-bold text-text-primary">会员特惠53折</span>
      </div>
    </button>
  );
}
