export type VoiceItem = {
  id: string;
  name: string;
  desc: string;
  tags: string[];
  category: string;
};

type VoiceGridProps = {
  voices: VoiceItem[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function VoiceGrid({ voices, selectedId, onSelect }: VoiceGridProps) {
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {voices.map((v) => {
        const selected = selectedId === v.id;
        const isMale = v.tags.includes("成年男声") || v.tags.includes("童年男声");
        const avatarBg = isMale ? "bg-[#74B9FF]" : "bg-[#FFB3C6]";
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            className={`text-left rounded-xl border-2 p-5 transition-all ${
              selected
                ? "brut-card-static ring-2 ring-accent/40"
                : "border-border bg-surface hover:bg-surface-hover"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${avatarBg} border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] text-text-primary font-black text-sm shrink-0`}
              >
                {v.name[0]}
              </div>
              <div className="min-w-0">
                <div className="text-text-primary font-bold truncate">{v.name}</div>
                <div className="mt-1 text-sm text-text-secondary">{v.desc}</div>
                <div className="mt-3 flex items-center gap-2">
                  {v.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className={`brut-tag ${
                        t.includes("男") ? "bg-[#74B9FF]/20 text-text-primary" : "bg-[#FFB3C6]/20 text-text-primary"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
