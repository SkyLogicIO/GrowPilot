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
        const a = isMale ? "from-blue-500" : "from-rose-500";
        const b = isMale ? "to-cyan-400" : "to-pink-400";
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            className={`text-left rounded-2xl border bg-white/5 p-5 transition-colors ${
              selected ? "border-blue-500" : "border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-r ${a} ${b} flex items-center justify-center text-white font-bold`}
              >
                V
              </div>
              <div className="min-w-0">
                <div className="text-white font-semibold truncate">{v.name}</div>
                <div className="mt-1 text-sm text-gray-400">{v.desc}</div>
                <div className="mt-3 flex items-center gap-2">
                  {v.tags.slice(0, 2).map((t) => (
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
            </div>
          </button>
        );
      })}
    </div>
  );
}
