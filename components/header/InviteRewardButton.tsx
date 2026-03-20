import { Gift } from "lucide-react";

export default function InviteRewardButton() {
  return (
    <button
      type="button"
      className="h-10 px-4 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 hover:bg-orange-500/20 transition-colors flex items-center gap-2"
    >
      <Gift size={18} className="text-orange-300" />
      <span className="text-sm font-semibold">邀请有礼</span>
    </button>
  );
}
