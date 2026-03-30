"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

interface GuestCTAsProps {
  onOpenLogin?: () => void;
}

export default function GuestCTAs({ onOpenLogin }: GuestCTAsProps) {
  const [authed, setAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access_token");
    setAuthed(Boolean(token));

    const onLogin = () => setAuthed(true);
    const onLogout = () => setAuthed(false);
    const onUnauthorized = () => setAuthed(false);

    window.addEventListener("growpilot:login", onLogin);
    window.addEventListener("growpilot:logout", onLogout);
    window.addEventListener("growpilot:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("growpilot:login", onLogin);
      window.removeEventListener("growpilot:logout", onLogout);
      window.removeEventListener("growpilot:unauthorized", onUnauthorized);
    };
  }, []);

  if (!mounted || authed) return null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="brut-btn-pill bg-yellow text-text-primary px-4 py-2 text-sm flex items-center gap-2"
      >
        <Gift size={15} />
        免费得积分
      </button>
      <button
        type="button"
        onClick={() => onOpenLogin?.()}
        className="brut-btn-pill bg-surface text-text-primary px-5 py-2 text-sm"
      >
        登录
      </button>
      <button
        type="button"
        onClick={() => onOpenLogin?.()}
        className="brut-btn-pill bg-purple text-white px-5 py-2 text-sm"
      >
        开始创作
      </button>
    </div>
  );
}
