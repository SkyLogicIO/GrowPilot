import type { ChangeEvent } from "react";
import type { VoiceItem } from "./VoiceGrid";

type ControlKey = "speed" | "volume" | "pitch";

type VoiceControlPanelProps = {
  selectedVoice: VoiceItem | null;
  style: string;
  onStyle: (style: string) => void;
  safeText: string;
  onText: (text: string) => void;
  speed: number;
  volume: number;
  pitch: number;
  onDecrement: (key: ControlKey) => void;
  onIncrement: (key: ControlKey) => void;
  onChange: (key: ControlKey, value: number) => void;
};

export default function VoiceControlPanel({
  selectedVoice,
  style,
  onStyle,
  safeText,
  onText,
  speed,
  volume,
  pitch,
  onDecrement,
  onIncrement,
  onChange,
}: VoiceControlPanelProps) {
  return (
    <div className="brut-card-static p-6">
      <div className="flex items-center justify-between">
        <div className="text-text-primary font-black text-lg">{selectedVoice?.name ?? "-"}</div>
        <div className="flex items-center gap-2">
          {(selectedVoice?.tags ?? []).slice(0, 2).map((t) => (
            <span
              key={t}
              className={`brut-tag ${
                t.includes("男") ? "bg-cyan-500/20 text-text-primary" : "bg-pink-500/20 text-text-primary"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-5">
        {["标准", "情感", "助理"].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm font-bold text-text-secondary cursor-pointer">
            <input
              type="radio"
              name="voice_style"
              checked={style === opt}
              onChange={() => onStyle(opt)}
              className="accent-accent"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-xl border-2 border-border bg-surface-hover p-4">
        <textarea
          value={safeText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onText(e.target.value)}
          className="w-full h-[210px] resize-none bg-transparent text-text-primary placeholder:text-text-muted outline-none"
          placeholder="请输入要合成的语音文本"
        />
        <div className="mt-2 text-right text-xs text-text-muted">{safeText.length}/250</div>
      </div>

      <div className="mt-6 space-y-5">
        {(
          [
            {
              key: "speed" as const,
              label: "语速",
              value: speed,
            },
            {
              key: "volume" as const,
              label: "音量",
              value: volume,
            },
            {
              key: "pitch" as const,
              label: "音高",
              value: pitch,
            },
          ] as const
        ).map((row) => (
          <div key={row.key} className="flex items-center gap-4">
            <div className="w-14 text-sm font-bold text-text-secondary">{row.label}</div>
            <button
              type="button"
              onClick={() => onDecrement(row.key)}
              className="w-9 h-9 rounded-lg bg-surface border-2 border-border hover:bg-surface-hover transition-colors text-text-primary font-bold"
            >
              -
            </button>
            <input
              type="range"
              min={1}
              max={10}
              value={row.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(row.key, Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <button
              type="button"
              onClick={() => onIncrement(row.key)}
              className="w-9 h-9 rounded-lg bg-surface border-2 border-border hover:bg-surface-hover transition-colors text-text-primary font-bold"
            >
              +
            </button>
            <div className="w-10 text-right text-sm font-bold text-text-secondary">{row.value}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 w-full h-12 brut-btn-primary"
      >
        立即合成
      </button>
    </div>
  );
}
