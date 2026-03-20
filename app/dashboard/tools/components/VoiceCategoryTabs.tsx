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
      ? "rounded-2xl border border-white/10 bg-white/5 p-6"
      : "flex items-center gap-2 border-b border-white/10 pb-4";

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const active = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
                active ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
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
