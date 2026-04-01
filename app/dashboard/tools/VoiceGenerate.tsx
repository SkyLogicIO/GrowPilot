"use client";

import { useMemo, useState } from "react";
import VoiceCopy from "./VoiceCopy";
import VoiceCategoryTabs, { type VoiceCategoryTabItem } from "./components/VoiceCategoryTabs";
import VoiceControlPanel from "./components/VoiceControlPanel";
import VoiceFilters, { type VoiceFilterGroup } from "./components/VoiceFilters";
import VoiceGrid, { type VoiceItem } from "./components/VoiceGrid";

const CATEGORY_TABS: VoiceCategoryTabItem[] = [
  { key: "standard", label: "普通话发音人" },
  { key: "multi", label: "多语言发音人" },
  { key: "copy", label: "语音复制" },
];

const FILTER_GROUPS: VoiceFilterGroup[] = [
  {
    key: "tone",
    label: "音色",
    options: ["全部", "成年男声", "成年女声", "童年女声", "童年男声"],
  },
  {
    key: "trait",
    label: "特性",
    options: ["全部", "多风格", "特色IP"],
  },
  {
    key: "scene",
    label: "场景推荐",
    options: ["全部", "阅读听书", "语音助手", "通用场景", "客服助理", "新闻播报", "智能客服", "教育培训"],
  },
];

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

type VoiceCategoryKey = "standard" | "multi" | "copy";

const buildVoicePool = (): VoiceItem[] => [
  {
    id: "voice_1",
    name: "聆飞哲",
    desc: "推荐：成年男声、亲切自然",
    tags: ["成年男声", "多风格"],
    category: "standard",
  },
  {
    id: "voice_2",
    name: "聆伯松",
    desc: "推荐：老年男声、反派老人",
    tags: ["成年男声", "特色IP"],
    category: "standard",
  },
  {
    id: "voice_3",
    name: "聆小珊",
    desc: "推荐：温柔活泼、亲切自然",
    tags: ["成年女声", "多风格"],
    category: "standard",
  },
  {
    id: "voice_4",
    name: "聆小琪",
    desc: "推荐：温柔自然、亲切自然",
    tags: ["成年女声", "多风格"],
    category: "standard",
  },
  {
    id: "voice_5",
    name: "聆飞晨",
    desc: "推荐：青春活力、清晰自然",
    tags: ["成年男声", "多风格"],
    category: "standard",
  },
  {
    id: "voice_6",
    name: "聆小瑶",
    desc: "推荐：清爽软妹、亲切自然",
    tags: ["成年女声", "多风格"],
    category: "standard",
  },
  {
    id: "voice_9",
    name: "Lynn",
    desc: "推荐：英文、多风格",
    tags: ["成年女声", "多风格"],
    category: "multi",
  },
  {
    id: "voice_10",
    name: "Ethan",
    desc: "推荐：英文、沉稳清晰",
    tags: ["成年男声", "多风格"],
    category: "multi",
  },
];

type FilterState = {
  tone: string;
  trait: string;
  scene: string;
};

type ControlKey = "speed" | "volume" | "pitch";

export default function VoiceGenerate() {
  const [category, setCategory] = useState<VoiceCategoryKey>("standard");
  const [filters, setFilters] = useState<FilterState>({ tone: "全部", trait: "全部", scene: "全部" });
  const [style, setStyle] = useState("标准");
  const [text, setText] = useState(
    "您好，欢迎来到 GrowPilot。请问有什么可以帮您？正在为您查询，请稍等。感谢您的来电，祝您生活愉快。"
  );
  const [speed, setSpeed] = useState(5);
  const [volume, setVolume] = useState(5);
  const [pitch, setPitch] = useState(5);

  const voicePool = useMemo(() => buildVoicePool(), []);
  const safeText = useMemo(() => text.slice(0, 250), [text]);

  const voices = useMemo(() => {
    if (category === "copy") return [];
    return voicePool
      .filter((v) => v.category === category)
      .filter((v) => {
        if (filters.tone !== "全部" && !v.tags.includes(filters.tone)) return false;
        if (filters.trait !== "全部" && !v.tags.includes(filters.trait)) return false;
        return true;
      });
  }, [category, filters.tone, filters.trait, voicePool]);

  const [selectedId, setSelectedId] = useState<string>(voicePool[0]?.id ?? "");

  const selectedVoice = useMemo(() => {
    const byId = voicePool.find((v) => v.id === selectedId);
    if (byId) return byId;
    return voices[0] ?? null;
  }, [selectedId, voicePool, voices]);

  const setFilterValue = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onChangeCategory = (next: string) => {
    setCategory(next as VoiceCategoryKey);
    if (next === "copy") return;
    const first = voicePool.find((v) => v.category === next);
    if (first) setSelectedId(first.id);
  };

  const onDecrement = (key: ControlKey) => {
    if (key === "speed") return setSpeed((v) => clamp(v - 1, 1, 10));
    if (key === "volume") return setVolume((v) => clamp(v - 1, 1, 10));
    return setPitch((v) => clamp(v - 1, 1, 10));
  };

  const onIncrement = (key: ControlKey) => {
    if (key === "speed") return setSpeed((v) => clamp(v + 1, 1, 10));
    if (key === "volume") return setVolume((v) => clamp(v + 1, 1, 10));
    return setPitch((v) => clamp(v + 1, 1, 10));
  };

  const onChange = (key: ControlKey, value: number) => {
    if (key === "speed") return setSpeed(value);
    if (key === "volume") return setVolume(value);
    return setPitch(value);
  };

  if (category === "copy") {
    return (
      <div className="mt-6 space-y-6">
        <VoiceCategoryTabs tabs={CATEGORY_TABS} activeKey={category} onChange={onChangeCategory} variant="boxed" />
        <VoiceCopy />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="brut-card-static p-6">
          <VoiceCategoryTabs tabs={CATEGORY_TABS} activeKey={category} onChange={onChangeCategory} />

          <VoiceFilters groups={FILTER_GROUPS} filters={filters} onChange={setFilterValue} />

          <div className="mt-6 text-sm font-bold text-text-secondary">此场景我们推荐以下发音人：</div>

          <VoiceGrid voices={voices} selectedId={selectedVoice?.id ?? ""} onSelect={setSelectedId} />
        </div>

        <VoiceControlPanel
          selectedVoice={selectedVoice}
          style={style}
          onStyle={setStyle}
          safeText={safeText}
          onText={setText}
          speed={speed}
          volume={volume}
          pitch={pitch}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
