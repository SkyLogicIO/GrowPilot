"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

export default function LanguageMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("中文");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      setIsOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="h-10 px-3 rounded-xl bg-surface-hover border-2 border-border text-text-primary hover:bg-white/[0.04] transition-colors flex items-center gap-2 shadow-[2px_2px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A]"
      >
        <Globe size={18} className="text-text-secondary" />
        <span className="text-sm font-bold">{activeLang}</span>
        <ChevronDown size={14} className="text-text-secondary ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border-2 border-border bg-surface shadow-[4px_4px_0px_#1A1A1A] overflow-hidden">
          {["中文", "英文", "西文"].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setActiveLang(lang);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm font-bold transition-colors border-b-2 border-border-light last:border-b-0 ${
                activeLang === lang ? "bg-accent/15 text-text-primary" : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
