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
          <div className="w-[78px] pt-2 text-sm font-bold text-text-secondary shrink-0">{group.label}</div>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const active = filters[group.key] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(group.key, opt)}
                  className={`h-9 px-4 rounded-lg text-sm font-bold border-2 transition-colors ${
                    active
                      ? "bg-accent/15 border-accent text-text-primary"
                      : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
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
