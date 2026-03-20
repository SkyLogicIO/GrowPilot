export type VoiceFilterGroup = {
  key: string;
  label: string;
  options: string[];
};

type VoiceFiltersProps = {
  groups: VoiceFilterGroup[];
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export default function VoiceFilters({ groups, filters, onChange }: VoiceFiltersProps) {
  return (
    <div className="mt-5 space-y-3">
      {groups.map((group) => (
        <div key={group.key} className="flex items-start gap-3">
          <div className="w-[78px] pt-2 text-sm text-gray-400 shrink-0">{group.label}</div>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const active = filters[group.key] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(group.key, opt)}
                  className={`h-9 px-4 rounded-xl text-sm font-semibold border transition-colors ${
                    active
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
