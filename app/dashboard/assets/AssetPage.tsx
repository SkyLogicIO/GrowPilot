"use client";

import { useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction, SyntheticEvent } from "react";
import { Copy, Heart, MoreHorizontal, Share2 } from "lucide-react";
import AddAssetModal, { type UserAsset } from "./AddAssetModal";
import FavoritesTab, { type RenderActionsArgs, type RenderCardArgs } from "./FavoritesTab";

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

const ORIENTATIONS = ["全部", "竖屏", "横屏"] as const;

const sortByNewest = <T extends { createdAt?: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

interface TemplateItem {
  id: string;
  tag: string;
  orientation: string;
  title: string;
  subtitle: string;
  cover: string;
}

const TEMPLATE_ITEMS: TemplateItem[] = [
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

interface ModuleItem {
  id: string;
  title: string;
  subtitle: string;
  copyText: string;
  cover: string;
}

const MODULE_ITEMS: ModuleItem[] = [
  {
    id: "m_1",
    title: "爆款标题生成",
    subtitle: "一键生成 10 条高点击标题",
    copyText: "请为‘餐饮新品套餐’生成 10 条短视频爆款标题，包含数字、情绪、利益点与强 CTA。",
    cover:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "m_2",
    title: "口播脚本模板",
    subtitle: "三段式结构：痛点-方案-行动",
    copyText: "口播脚本结构：1）开场痛点；2）核心解决方案三点；3）结果展示；4）强 CTA（关注/私信/到店）。",
    cover:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "m_3",
    title: "小红书种草文案",
    subtitle: "3 条不同风格种草文案",
    copyText: "请生成 3 条小红书种草文案：强调低糖、口感、限时优惠，并给出 3 个话题标签。",
    cover:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "m_4",
    title: "同城引流话术",
    subtitle: "适用于门店到店/自提转化",
    copyText: "请输出 5 条同城引流话术，包含：优惠点、距离/时间、到店路径、限时紧迫感、私信引导。",
    cover:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80",
  },
];

const tryCopy = async (text: string): Promise<boolean> => {
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

type AssetsPageView = "library" | "favorites" | "myAssets";

export interface AssetPageProps {
  initialView?: AssetsPageView;
  initialTag?: string;
  initialOrientation?: string;
}

interface HoverActionsProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onMore: () => void;
}

function HoverActions({ isFavorite, onToggleFavorite, onShare, onMore }: HoverActionsProps) {
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

interface CoverCardProps {
  cover: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}

function CoverCard({ cover, title, subtitle, children }: CoverCardProps) {
  return (
    <div className="group relative rounded-2xl border border-white/5 overflow-hidden bg-white/5">
      <div className="relative w-full aspect-[4/3]">
        <img
          src={cover}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e: SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1400&q=80";
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

export default function AssetPage({
  initialView = "library",
  initialTag = "推荐",
  initialOrientation = "全部",
}: AssetPageProps = {}) {
  const [activeView, setActiveView] = useState<AssetsPageView>(initialView);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [activeOrientation, setActiveOrientation] = useState<string>(initialOrientation);
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<Set<string>>(() => new Set());
  const [favoriteModuleIds, setFavoriteModuleIds] = useState<Set<string>>(() => new Set());
  const [favoriteAssetIds, setFavoriteAssetIds] = useState<Set<string>>(() => new Set());
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [addAssetOpen, setAddAssetOpen] = useState(false);

  const baseTemplates = useMemo(() => {
    return TEMPLATE_ITEMS.filter((item) => {
      const matchTag = activeTag ? item.tag === activeTag || (activeTag === "推荐" && true) : true;
      const matchOrientation = activeOrientation === "全部" ? true : item.orientation === activeOrientation;
      return matchTag && matchOrientation;
    });
  }, [activeOrientation, activeTag]);

  const filledFavoriteTemplates = useMemo(() => {
    const favorites = baseTemplates.filter((item) => favoriteTemplateIds.has(item.id));
    const fillers = baseTemplates.filter((item) => !favoriteTemplateIds.has(item.id));
    const targetCount = 8;

    const next = [...favorites];
    if (next.length < targetCount) {
      next.push(...fillers.slice(0, Math.max(0, targetCount - next.length)));
    }

    return next;
  }, [baseTemplates, favoriteTemplateIds]);

  const visibleModules = useMemo(() => {
    if (activeView === "library") return MODULE_ITEMS;
    if (activeView === "favorites") return MODULE_ITEMS.filter((x) => favoriteModuleIds.has(x.id));
    return [];
  }, [activeView, favoriteModuleIds]);

  const visibleMyAssets = useMemo(() => sortByNewest(assets), [assets]);

  const visibleAssets = useMemo(() => {
    const base = sortByNewest(assets);
    if (activeView !== "favorites") return base;
    return base.filter((x) => favoriteAssetIds.has(x.id));
  }, [activeView, assets, favoriteAssetIds]);

  const favoriteCategoryOptions = useMemo(() => ["全部", ...TEMPLATE_TAGS.filter((x) => x !== "推荐")], []);
  const selectedFavoriteCategory = activeTag === "推荐" ? "全部" : activeTag;

  const toggleFavorite = (setter: Dispatch<SetStateAction<Set<string>>>, id: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderActions = ({ isFavorite, onToggleFavorite, onShare, onMore }: RenderActionsArgs) => (
    <HoverActions isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} onShare={onShare} onMore={onMore} />
  );

  const renderCard = ({ key, cover, title, subtitle, children }: RenderCardArgs) => (
    <CoverCard key={key} cover={cover} title={title} subtitle={subtitle}>
      {children}
    </CoverCard>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setActiveView("favorites")}
            className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
              activeView === "favorites" ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            我的收藏
          </button>
          <button
            type="button"
            onClick={() => setActiveView("library")}
            className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
              activeView === "library" ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            热门推荐
          </button>
        </div>
      </div>

      {activeView === "favorites" ? (
        <FavoritesTab
          activeTag={activeTag}
          onSelectRecent={() => setActiveTag("推荐")}
          categoryOptions={favoriteCategoryOptions}
          selectedCategory={selectedFavoriteCategory}
          onSelectCategory={(value) => setActiveTag(value === "全部" ? "推荐" : value)}
          orientationOptions={[...ORIENTATIONS]}
          activeOrientation={activeOrientation}
          onChangeOrientation={(value) => setActiveOrientation(value)}
          onOpenAddAsset={() => setAddAssetOpen(true)}
          templates={filledFavoriteTemplates}
          assets={visibleAssets}
          favoriteTemplateIds={favoriteTemplateIds}
          onToggleTemplateFavorite={(id) => toggleFavorite(setFavoriteTemplateIds, id)}
          onShareTemplate={(id) => tryCopy(`${window.location.origin}/dashboard/assets?template=${id}`)}
          favoriteAssetIds={favoriteAssetIds}
          onToggleAssetFavorite={(id) => toggleFavorite(setFavoriteAssetIds, id)}
          onShareAsset={(id) => {
            const asset = visibleAssets.find((x) => x.id === id);
            if (!asset) return;
            const text = asset.type === "link" ? asset.src : `${asset.name}\n${asset.src}`;
            tryCopy(text);
          }}
          renderCard={renderCard}
          renderActions={renderActions}
        />
      ) : activeView === "myAssets" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">我的视图库</div>
              <div className="mt-1 text-sm text-gray-400">支持批量上传图片/视频/链接，便于复用</div>
            </div>
            <button
              type="button"
              onClick={() => setAddAssetOpen(true)}
              className="h-10 px-5 rounded-full bg-accent hover:bg-accent-light text-white text-sm font-bold transition-colors shadow-lg shadow-accent/30"
            >
              添加素材
            </button>
          </div>

          {visibleMyAssets.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleMyAssets.map((asset) => {
                const subtitle = asset.type === "link" ? "链接素材" : asset.type === "video" ? "视频素材" : "图片素材";
                const cover =
                  asset.type === "image"
                    ? asset.src
                    : "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1400&q=80";

                return renderCard({
                  key: asset.id,
                  cover,
                  title: asset.name,
                  subtitle,
                  children: (
                    <>
                      {renderActions({
                        isFavorite: favoriteAssetIds.has(asset.id),
                        onToggleFavorite: () => toggleFavorite(setFavoriteAssetIds, asset.id),
                        onShare: () => {
                          const text = asset.type === "link" ? asset.src : `${asset.name}\n${asset.src}`;
                          tryCopy(text);
                        },
                        onMore: () => {},
                      })}
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
                    </>
                  ),
                });
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center">
              <div className="text-white font-bold">还没有素材</div>
              <div className="mt-2 text-sm text-gray-400">点击右上角“添加素材”开始上传或粘贴链接</div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 flex flex-wrap gap-2">
              {TEMPLATE_TAGS.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={`h-9 px-4 rounded-full border text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-white text-[#0F1115] border-white"
                        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="shrink-0">
              <select
                value={activeOrientation}
                onChange={(e) => setActiveOrientation(e.target.value)}
                className="h-9 px-4 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold focus:outline-none focus:border-accent-light transition-colors"
              >
                {ORIENTATIONS.map((item) => (
                  <option key={item} value={item} className="bg-surface">
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {baseTemplates.map((item) => (
              <CoverCard key={item.id} cover={item.cover} title={item.title} subtitle={item.subtitle}>
                <HoverActions
                  isFavorite={favoriteTemplateIds.has(item.id)}
                  onToggleFavorite={() => toggleFavorite(setFavoriteTemplateIds, item.id)}
                  onShare={() => tryCopy(`${window.location.origin}/dashboard/assets?template=${item.id}`)}
                  onMore={() => {}}
                />
              </CoverCard>
            ))}
          </div>
        </div>
      )}

      {activeView === "library" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">模块库</div>
              <div className="mt-1 text-sm text-gray-400">悬浮可一键复制模板提示词或结构</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleModules.map((item) => (
              <div key={item.id} className="group relative">
                <CoverCard cover={item.cover} title={item.title} subtitle={item.subtitle}>
                  <HoverActions
                    isFavorite={favoriteModuleIds.has(item.id)}
                    onToggleFavorite={() => {
                      setFavoriteModuleIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        return next;
                      });
                    }}
                    onShare={async () => {
                      const url = `${window.location.origin}/dashboard/assets?module=${item.id}`;
                      await tryCopy(url);
                    }}
                    onMore={() => {}}
                  />

                  <div className="absolute left-4 bottom-14 z-10 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await tryCopy(item.copyText);
                      }}
                      className="px-4 h-10 rounded-full bg-accent hover:bg-accent-light text-white text-sm font-bold transition-all shadow-lg shadow-accent/30 flex items-center justify-center gap-2"
                    >
                      <Copy size={16} className="text-white" />
                      一键复制
                    </button>
                  </div>
                </CoverCard>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <AddAssetModal
        open={addAssetOpen}
        onClose={() => setAddAssetOpen(false)}
        onAdd={(asset) => {
          setAssets((prev) => [asset, ...prev]);
          setFavoriteAssetIds((prev) => {
            const next = new Set(prev);
            next.add(asset.id);
            return next;
          });
        }}
      />
    </div>
  );
}
