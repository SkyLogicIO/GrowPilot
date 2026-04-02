import { Gift } from "lucide-react";

export default function InviteRewardButton() {
  return (
    <button
      type="button"
      className="h-10 px-4 rounded-full bg-[#FF6B6B]/15 border-2 border-[#FF6B6B]/40 text-[#FF6B6B] hover:bg-[#FF6B6B]/25 transition-colors flex items-center gap-2 shadow-[2px_2px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A]"
    >
      <Gift size={18} />
      <span className="text-sm font-bold">邀请有礼</span>
    </button>
  );
}
