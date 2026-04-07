"use client";

import { useState } from "react";
import { Diamond, Zap } from "lucide-react";
import MembershipModal from "./MembershipModal";

export default function CoinsVipButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-10 px-4 rounded-full bg-white/[0.05] border border-white/[0.08] text-text-primary hover:bg-white/[0.1] hover:border-white/[0.15] transition-colors flex items-center gap-3"
      >
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-[#FFD93D]" />
          <span className="text-sm font-bold text-text-primary">20</span>
          <span className="text-sm font-bold text-text-secondary">充值</span>
        </div>
        <span className="w-px h-5 bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <Diamond size={18} className="text-[#C77DFF]" />
          <span className="text-sm font-bold text-text-primary">会员特惠53折</span>
        </div>
      </button>

      <MembershipModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
