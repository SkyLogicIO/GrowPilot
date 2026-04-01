export type VoiceCategoryTabItem = {
  key: string;
  label: string;
};

type VoiceCategoryTabsProps = {
  tabs: VoiceCategoryTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: "boxed";
};

export default function VoiceCategoryTabs({ tabs, activeKey, onChange, variant }: VoiceCategoryTabsProps) {
  const containerClass =
    variant === "boxed"
      ? "brut-card-static p-6"
      : "flex items-center gap-2 border-b-2 border-border pb-4";

  return (
    <div className={containerClass}>
      <div className="inline-flex items-center gap-1 rounded-xl bg-surface-hover border-2 border-border p-1">
        {tabs.map((tab) => {
          const active = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`h-10 px-4 rounded-lg text-sm font-bold transition-colors ${
                active
                  ? "bg-accent text-white shadow-[2px_2px_0px_#1A1A1A]"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
