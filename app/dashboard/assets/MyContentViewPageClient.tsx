"use client";

import { useMemo, useState } from "react";
import { Heart, MoreHorizontal, Share2 } from "lucide-react";
import AddAssetModal from "./AddAssetModal";

// Constants shared with AssetPage
const TEMPLATE_TAGS = [
  "推荐",
  "知识口播",
  "单集课程",
  "情绪口播",
  "获客营销",
  "节日热点",
  "法律科普",
  "教育培训",
  "广告宣传",
  "新闻资讯",
  "素材配音",
  "数字人推广",
];

const ORIENTATIONS = ["全部", "竖屏", "横屏"];

const TEMPLATE_ITEMS = [
  {
    id: "t_1",
    tag: "节日热点",
    orientation: "竖屏",
    title: "冬至大如年",
    subtitle: "冬至 · 节气特辑",
    cover:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "t_2",
    tag: "节日热点",
    orientation: "竖屏",
    title: "二十四节气 · 冬至",
    subtitle: "冬至到了",
    cover:
      "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "t_3",
    tag: "教育培训",
    orientation: "竖屏",
    title: "古人对话课",
    subtitle: "教育培训 · 古人对话",
    cover:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "t_4",
    tag: "教育培训",
    orientation: "竖屏",
    title: "find shelter",
    subtitle: "英语训练 · 词句讲解",
    cover:
      "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "t_5",
    tag: "知识口播",
    orientation: "横屏",
    title: "一分钟科普",
    subtitle: "知识口播 · 高频问题",
    cover:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "t_6",
    tag: "新闻资讯",
    orientation: "横屏",
    title: "每日快讯",
    subtitle: "新闻资讯 · 早晚报",
    cover:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "t_7",
    tag: "广告宣传",
    orientation: "竖屏",
    title: "新品上新",
    subtitle: "广告宣传 · CTA 强引导",
    cover:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "t_8",
    tag: "获客营销",
    orientation: "竖屏",
    title: "门店引流",
    subtitle: "获客营销 · 同城转化",
    cover:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  },
];

const sortByNewest = (items: any[]) => [...items].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

// Helper functions
const tryCopy = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return true;
  } catch {
    return false;
  }
};

function HoverActions({
  isFavorite,
  onToggleFavorite,
  onShare,
  onMore,
}: {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onMore: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 z-10 flex items-center justify-end gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md transition-colors flex items-center justify-center"
        aria-label="收藏"
      >
        <Heart
          size={18}
          className={isFavorite ? "text-pink-300" : "text-white"}
          fill={isFavorite ? "currentColor" : "none"}
        />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onShare();
        }}
        className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md transition-colors flex items-center justify-center"
        aria-label="分享"
      >
        <Share2 size={18} className="text-white" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onMore();
        }}
        className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md transition-colors flex items-center justify-center"
        aria-label="更多"
      >
        <MoreHorizontal size={18} className="text-white" />
      </button>
    </div>
  );
}

function CoverCard({ cover, title, subtitle, children }: { cover: string; title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="group relative rounded-2xl border border-white/5 overflow-hidden bg-white/5">
      <div className="relative w-full aspect-[4/3]">
        <img
          src={cover}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1400&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {children}
        <div className="absolute left-4 bottom-4 right-4">
          <div className="text-white font-bold text-base leading-snug line-clamp-2">{title}</div>
          <div className="mt-1 text-xs text-white/80 line-clamp-1">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

export default function MyContentViewPageClient() {
  const [activeTag, setActiveTag] = useState("最近新增");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [activeOrientation, setActiveOrientation] = useState("全部");
  const [assets, setAssets] = useState<any[]>([]);
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState(() => new Set<string>());
  const [favoriteAssetIds, setFavoriteAssetIds] = useState(() => new Set<string>());

  const categoryOptions = useMemo(() => ["全部", ...TEMPLATE_TAGS], []);

  // Use TEMPLATE_ITEMS as initial content but respect filters
  const visibleTemplates = useMemo(() => {
    return TEMPLATE_ITEMS.filter((item) => {
      // Mapping "最近新增" to "推荐" logic or showing all
      const effectiveTag = activeTag === "最近新增" ? "推荐" : activeTag;
      const matchTag = effectiveTag === "推荐" ? true : item.tag === effectiveTag;
      
      const matchCategory = selectedCategory === "全部" ? true : item.tag === selectedCategory;
      const matchOrientation = activeOrientation === "全部" ? true : item.orientation === activeOrientation;
      
      return matchTag && matchCategory && matchOrientation;
    });
  }, [activeTag, selectedCategory, activeOrientation]);

  const visibleAssets = useMemo(() => {
    // User assets filtering logic could be added here if they have tags/orientation
    return sortByNewest(assets);
  }, [assets]);

  const toggleTemplateFavorite = (id: string) => {
    setFavoriteTemplateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAssetFavorite = (id: string) => {
    setFavoriteAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xl font-bold text-white">我的视图库</div>
          <div className="mt-1 text-sm text-gray-400">支持批量上传图片/视频/链接，便于复用</div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag("最近新增")}
            className={`h-9 px-4 rounded-full border text-sm font-semibold transition-colors ${
              activeTag === "最近新增"
                ? "bg-white text-[#0F1115] border-white"
                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
            }`}
          >
            最近新增
          </button>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddAssetOpen(true)}
            className="h-9 px-4 rounded-full bg-accent hover:bg-accent-light text-white text-sm font-bold transition-colors shadow-lg shadow-accent/30"
          >
            添加图像/视频
          </button>

          <div className="text-sm font-semibold text-gray-300">筛选</div>

          <div className="h-9 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-4 bg-transparent text-gray-200 text-sm font-semibold focus:outline-none"
            >
              {categoryOptions.map((item) => (
                <option key={item} value={item} className="bg-surface">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="h-9 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <select
              value={activeOrientation}
              onChange={(e) => setActiveOrientation(e.target.value)}
              className="h-9 px-4 bg-transparent text-gray-200 text-sm font-semibold focus:outline-none"
            >
              {ORIENTATIONS.map((item) => (
                <option key={item} value={item} className="bg-surface">
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid (Demo Content) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleTemplates.map((item) => (
          <CoverCard
            key={item.id}
            cover={item.cover}
            title={item.title}
            subtitle={item.subtitle}
          >
            <HoverActions
              isFavorite={favoriteTemplateIds.has(item.id)}
              onToggleFavorite={() => toggleTemplateFavorite(item.id)}
              onShare={() => tryCopy(`${window.location.origin}/dashboard/assets?template=${item.id}`)}
              onMore={() => {}}
            />
          </CoverCard>
        ))}
      </div>

      {/* User Assets Grid */}
      {visibleAssets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {visibleAssets.map((asset) => {
            const subtitle = asset.type === "link" ? "链接素材" : asset.type === "video" ? "视频素材" : "图片素材";
            const cover =
              asset.type === "image"
                ? asset.src
                : "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1400&q=80";

            return (
              <CoverCard
                key={asset.id}
                cover={cover}
                title={asset.name}
                subtitle={subtitle}
              >
                <HoverActions
                  isFavorite={favoriteAssetIds.has(asset.id)}
                  onToggleFavorite={() => toggleAssetFavorite(asset.id)}
                  onShare={() => {
                    const text = asset.type === "link" ? asset.src : `${asset.name}\n${asset.src}`;
                    tryCopy(text);
                  }}
                  onMore={() => {}}
                />
                {asset.type === "video" ? (
                  <div className="absolute inset-0">
                    <video
                      src={asset.src}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  </div>
                ) : null}
              </CoverCard>
            );
          })}
        </div>
      )}

      {visibleTemplates.length === 0 && visibleAssets.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
          <div className="text-white font-bold">还没有素材</div>
          <div className="mt-2 text-sm text-gray-400">点击右上角“添加素材”开始上传或粘贴链接</div>
        </div>
      )}

      <AddAssetModal
        open={addAssetOpen}
        onClose={() => setAddAssetOpen(false)}
        onAdd={(asset: any) => {
          setAssets((prev) => [asset, ...prev]);
        }}
      />
    </div>
  );
}
