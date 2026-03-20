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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div className="text-white font-bold text-lg">{selectedVoice?.name ?? "-"}</div>
        <div className="flex items-center gap-2">
          {(selectedVoice?.tags ?? []).slice(0, 2).map((t) => (
            <span
              key={t}
              className={`h-6 px-2 rounded-md text-xs font-semibold ${
                t.includes("男") ? "bg-blue-600/20 text-blue-200" : "bg-emerald-600/20 text-emerald-200"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-5">
        {["标准", "情感", "助理"].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="radio"
              name="voice_style"
              checked={style === opt}
              onChange={() => onStyle(opt)}
              className="accent-blue-500"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-[#0B0D10]/40 p-4">
        <textarea
          value={safeText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onText(e.target.value)}
          className="w-full h-[210px] resize-none bg-transparent text-white placeholder:text-gray-500 outline-none"
          placeholder="请输入要合成的语音文本"
        />
        <div className="mt-2 text-right text-xs text-gray-400">{safeText.length}/250</div>
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
            <div className="w-14 text-sm text-gray-300">{row.label}</div>
            <button
              type="button"
              onClick={() => onDecrement(row.key)}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
            >
              -
            </button>
            <input
              type="range"
              min={1}
              max={10}
              value={row.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(row.key, Number(e.target.value))}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => onIncrement(row.key)}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
            >
              +
            </button>
            <div className="w-10 text-right text-sm text-gray-300">{row.value}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold shadow-lg shadow-blue-500/20"
      >
        立即合成
      </button>
    </div>
  );
}
