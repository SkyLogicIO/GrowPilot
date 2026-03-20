import { Diamond, Zap } from "lucide-react";

export default function CoinsVipButton() {
  return (
    <button
      type="button"
      className="h-10 px-4 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors flex items-center gap-3"
    >
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-blue-300" />
        <span className="text-sm font-semibold text-blue-200">20</span>
        <span className="text-sm font-medium text-gray-200">充值</span>
      </div>
      <span className="w-px h-5 bg-white/10" />
      <div className="flex items-center gap-2">
        <Diamond size={18} className="text-yellow-300" />
        <span className="text-sm font-semibold">会员特惠53折</span>
      </div>
    </button>
  );
}
