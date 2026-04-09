import { Gift } from "lucide-react";

interface Props {
  onClick?: () => void;
}

export default function InviteRewardButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 px-4 rounded-full bg-rose-500/15 border-2 border-rose-500/40 text-rose-500 hover:bg-rose-500/25 transition-colors flex items-center gap-2 shadow-[2px_2px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A]"
    >
      <Gift size={18} />
      <span className="text-sm font-bold">邀请有礼</span>
    </button>
  );
}
