"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Disc3, Heart, Plus, Search, UserRound } from "lucide-react";
import CreateVoiceModal from "./CreateVoiceModal";

type VoiceItem = {
  id: string;
  name: string;
  gender: "男" | "女";
  age: "青年" | "中年" | "成熟";
  style: "沉稳冷静" | "元气活力" | "亲和力强" | "专业讲解" | "温柔清晰";
  scene: "教师讲座" | "广告营销" | "通用场景";
  language: "中文" | "英文" | "多语言";
};

const PUBLIC_VOICES: VoiceItem[] = [
  {
    id: "public_boris",
    name: "Boris",
    gender: "男",
    age: "青年",
    style: "沉稳冷静",
    scene: "教师讲座",
    language: "多语言",
  },
  {
    id: "public_dmitri",
    name: "Dmitri",
    gender: "男",
    age: "中年",
    style: "沉稳冷静",
    scene: "教师讲座",
    language: "多语言",
  },
  {
    id: "public_zoye",
    name: "Zoye",
    gender: "女",
    age: "青年",
    style: "元气活力",
    scene: "通用场景",
    language: "多语言",
  },
  {
    id: "public_tatiana",
    name: "Tatiana",
    gender: "女",
    age: "中年",
    style: "亲和力强",
    scene: "通用场景",
    language: "多语言",
  },
  {
    id: "public_anneliese",
    name: "Anneliese",
    gender: "女",
    age: "青年",
    style: "元气活力",
    scene: "广告营销",
    language: "多语言",
  },
  {
    id: "public_maximilian",
    name: "Maximilian",
    gender: "男",
    age: "中年",
    style: "专业讲解",
    scene: "教师讲座",
    language: "多语言",
  },
];

const FILTERS = {
  gender: ["全部", "男", "女"] as const,
  age: ["全部", "青年", "中年", "成熟"] as const,
  style: ["全部", "沉稳冷静", "元气活力", "亲和力强", "专业讲解", "温柔清晰"] as const,
  scene: ["全部", "教师讲座", "广告营销", "通用场景"] as const,
  language: ["全部", "中文", "英文", "多语言"] as const,
};

type TabKey = "public" | "favorites";

export default function MyVoicePageClient() {
  const [tab, setTab] = useState<TabKey>("public");
  const [gender, setGender] = useState<(typeof FILTERS.gender)[number]>("全部");
  const [age, setAge] = useState<(typeof FILTERS.age)[number]>("全部");
  const [style, setStyle] = useState<(typeof FILTERS.style)[number]>("全部");
  const [scene, setScene] = useState<(typeof FILTERS.scene)[number]>("全部");
  const [language, setLanguage] = useState<(typeof FILTERS.language)[number]>("全部");
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(["public_boris", "public_zoye", "public_anneliese"]));
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = PUBLIC_VOICES.filter((v) => {
      if (gender !== "全部" && v.gender !== gender) return false;
      if (age !== "全部" && v.age !== age) return false;
      if (style !== "全部" && v.style !== style) return false;
      if (scene !== "全部" && v.scene !== scene) return false;
      if (language !== "全部" && v.language !== language) return false;
      if (q && !v.name.toLowerCase().includes(q)) return false;
      return true;
    });

    if (tab === "favorites") return base.filter((v) => favoriteIds.has(v.id));
    return base;
  }, [age, favoriteIds, gender, language, query, scene, style, tab]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
        <div className="absolute inset-0 bg-surface/40" />
        <div className="relative px-8 py-7 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-white">创建您的第一个声音！</div>
              <span className="h-6 px-2 rounded-md bg-blue-500/15 border border-blue-400/30 text-xs font-bold text-accent-bright">
                Starter
              </span>
            </div>
            <div className="mt-2 text-sm text-white/70">几分钟内即可创建与您音色如出一辙的声音脚本！</div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-accent hover:bg-accent-light transition-colors text-white text-sm font-bold shadow-lg shadow-accent/30"
              >
                <Plus size={16} />
                创建声音
              </button>
            </div>
          </div>

          <div className="hidden lg:flex justify-end">
            <div className="relative w-[360px] h-[160px]">
              <div className="absolute right-0 top-4 w-[170px] h-[220px] rounded-3xl bg-white/10 border border-white/15 backdrop-blur-md rotate-6 shadow-2xl" />
              <div className="absolute right-6 top-0 w-[170px] h-[220px] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 backdrop-blur-md -rotate-3 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-70 bg-gradient-to-br from-purple-500/25 via-blue-500/10 to-transparent" />
                <div className="relative p-5 flex items-center justify-center h-full">
                  <UserRound size={66} className="text-white/80" />
                </div>
              </div>
              <div className="absolute left-0 top-8 w-[170px] h-[220px] rounded-3xl bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border border-white/15 backdrop-blur-md -rotate-12 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-70 bg-gradient-to-br from-cyan-500/25 via-blue-500/10 to-transparent" />
                <div className="relative p-5 flex items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-full bg-black/35 border border-white/15 flex items-center justify-center">
                    <Disc3 size={34} className="text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setTab("public")}
            className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
              tab === "public" ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            公共声音
          </button>
          <button
            type="button"
            onClick={() => setTab("favorites")}
            className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
              tab === "favorites" ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            收藏的声音
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as (typeof FILTERS.gender)[number])}
            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold focus:outline-none focus:border-accent-light transition-colors"
          >
            {FILTERS.gender.map((x) => (
              <option key={x} value={x} className="bg-surface">
                {x === "全部" ? "全部性别" : x}
              </option>
            ))}
          </select>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value as (typeof FILTERS.age)[number])}
            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold focus:outline-none focus:border-accent-light transition-colors"
          >
            {FILTERS.age.map((x) => (
              <option key={x} value={x} className="bg-surface">
                {x === "全部" ? "所有年龄" : x}
              </option>
            ))}
          </select>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as (typeof FILTERS.style)[number])}
            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold focus:outline-none focus:border-accent-light transition-colors"
          >
            {FILTERS.style.map((x) => (
              <option key={x} value={x} className="bg-surface">
                {x === "全部" ? "全部风格" : x}
              </option>
            ))}
          </select>
          <select
            value={scene}
            onChange={(e) => setScene(e.target.value as (typeof FILTERS.scene)[number])}
            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold focus:outline-none focus:border-accent-light transition-colors"
          >
            {FILTERS.scene.map((x) => (
              <option key={x} value={x} className="bg-surface">
                {x === "全部" ? "全部场景" : x}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as (typeof FILTERS.language)[number])}
            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold focus:outline-none focus:border-accent-light transition-colors"
          >
            {FILTERS.language.map((x) => (
              <option key={x} value={x} className="bg-surface">
                {x === "全部" ? "全部语种" : x}
              </option>
            ))}
          </select>
        </div>

        <div className="xl:w-[320px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索声音"
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold placeholder:text-gray-500 focus:outline-none focus:border-accent-light transition-colors"
          />
        </div>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const favored = favoriteIds.has(v.id);
            return (
              <div
                key={v.id}
                className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {v.name.slice(0, 1).toUpperCase()}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-white font-bold truncate">{v.name}</div>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(v.id)}
                        className={`w-9 h-9 rounded-xl border transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 ${
                          favored
                            ? "bg-pink-500/15 border-pink-400/30 hover:bg-pink-500/20"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                        aria-label={favored ? "取消收藏" : "收藏"}
                      >
                        <Heart size={16} className={favored ? "text-pink-300" : "text-gray-300"} fill={favored ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {[v.age, `${v.gender}声`, v.style, v.scene].map((t) => (
                        <span
                          key={t}
                          className="h-6 px-2 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-gray-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
          <div className="text-white font-bold">暂无可用声音</div>
          <div className="mt-2 text-sm text-gray-400">调整筛选条件，或前往“创建声音”生成新的声音</div>
        </div>
      )}
      <CreateVoiceModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
}

