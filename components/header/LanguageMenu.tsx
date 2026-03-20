"use client";

import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";

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
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors flex items-center gap-2"
      >
        <Globe size={18} className="text-gray-300" />
        <span className="text-sm font-semibold">{activeLang}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-44 rounded-2xl border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10 overflow-hidden">
          {["中文", "英文", "西文"].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setActiveLang(lang);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors ${
                activeLang === lang ? "text-white bg-white/10" : "text-gray-200 hover:bg-white/5"
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
