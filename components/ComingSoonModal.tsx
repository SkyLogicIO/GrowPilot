"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export default function ComingSoonModal({
  isOpen,
  onClose,
  featureName,
}: ComingSoonModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-fade-up relative w-[min(420px,90vw)] brut-card bg-surface p-8 text-center">
        {/* 关闭按钮 */}
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={20} />
        </button>

        {/* 图标 */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-accent border-2 border-border flex items-center justify-center shadow-[3px_3px_0px_#1A1A1A]">
          <Sparkles size={28} className="text-white" />
        </div>

        {/* 标题 */}
        <h3 className="text-2xl font-black text-text-primary mb-3">
          {featureName}
        </h3>

        {/* 描述 */}
        <p className="text-text-secondary mb-6 leading-relaxed">
          该功能正在紧锣密鼓开发中，<br />
          很快就能与您见面！
        </p>

        {/* 标签 */}
        <div className="flex justify-center gap-2 mb-6">
          <span className="brut-tag bg-[#FFD93D] text-black">即将上线</span>
          <span className="brut-tag bg-[#4ECDC4] text-white">敬请期待</span>
        </div>

        {/* 按钮 */}
        <button
          onClick={onClose}
          className="brut-btn bg-accent text-white px-8 py-3 text-base w-full"
        >
          我知道了
        </button>
      </div>
    </div>,
    document.body
  );
}
