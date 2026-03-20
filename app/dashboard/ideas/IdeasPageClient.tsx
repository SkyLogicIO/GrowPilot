"use client";

import type { KeyboardEvent, SyntheticEvent } from "react";
import { useMemo, useState } from "react";
import { Bookmark, Download, X } from "lucide-react";
import MediaDetailPage from "./MediaDetailPage";
import {
  FALLBACK_COVER,
  FILTER_TAGS_BY_TAB,
  getTabItems,
  TOP_TABS,
  type IdeaDetailItem,
  type IdeaItem,
  type TabKey,
} from "./ideasData";

type TopTabKey = TabKey | "detail";

type TabFiltersState = Partial<Record<TopTabKey, string>>;
type TabSortsState = Partial<Record<TopTabKey, string>>;

interface InspirationGalleryProps {
  filterTags: string[];
  activeFilter: string;
  onChangeFilter: (tag: string) => void;
  sort: string;
  onChangeSort: (value: string) => void;
  items: IdeaItem[];
  onOpenDetail: (item: IdeaItem) => void;
}

function InspirationGallery({
  filterTags,
  activeFilter,
  onChangeFilter,
  sort,
  onChangeSort,
  items,
  onOpenDetail,
}: InspirationGalleryProps) {
  const handleItemKeyDown = (e: KeyboardEvent<HTMLDivElement>, item: IdeaItem) => {
    if (e.key === "Enter" || e.key === " ") onOpenDetail(item);
  };

  const handleImgError = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_COVER;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto">
          {filterTags.map((tag) => {
            const active = activeFilter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onChangeFilter(tag)}
                className={`shrink-0 h-9 px-4 rounded-full border text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white text-[#0F1115] border-white"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => onChangeSort(e.target.value)}
            className="h-9 px-4 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors"
          >
            {["推荐", "最新"].map((item) => (
              <option key={item} value={item} className="bg-[#0F1115]">
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="h-9 px-4 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            筛选
          </button>
        </div>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="mb-4 break-inside-avoid">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpenDetail(item)}
              onKeyDown={(e) => handleItemKeyDown(e, item)}
              className="w-full text-left group relative rounded-2xl border border-white/5 overflow-hidden bg-white/5 cursor-pointer"
            >
              <img src={item.cover} alt={item.title} className="w-full h-auto block" onError={handleImgError} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10" />

              <div className="absolute left-1/2 -translate-x-1/2 bottom-[56px] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm px-2 py-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="relative group/icon w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
                    aria-label="收藏"
                  >
                    <Bookmark size={18} className="text-gray-200" />
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/icon:opacity-100 transition-opacity text-xs text-gray-200 bg-black/70 border border-white/10 rounded-lg px-2 py-1 whitespace-nowrap">
                      收藏
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="h-9 px-7 min-w-[116px] whitespace-nowrap text-center rounded-full bg-white/5 border border-white/10 text-white text-sm font-extrabold hover:bg-white/10 transition-colors"
                  >
                    一键同款
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="relative group/icon w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
                    aria-label="下载"
                  >
                    <Download size={18} className="text-gray-200" />
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/icon:opacity-100 transition-opacity text-xs text-gray-200 bg-black/70 border border-white/10 rounded-lg px-2 py-1 whitespace-nowrap">
                      下载
                    </span>
                  </button>
                </div>
              </div>

              {item.type === "video" ? (
                <div className="absolute left-4 top-4 w-9 h-9 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[10px] border-l-white/90 translate-x-[1px]" />
                </div>
              ) : null}
              <div className="absolute left-0 right-0 bottom-0 p-3">
                <div className="rounded-xl bg-black/35 border border-white/10 backdrop-blur-sm px-3 py-2">
                  <div className="text-sm font-semibold text-white line-clamp-1">{item.title}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IdeasPageClient() {
  const [activeTopTab, setActiveTopTab] = useState<TopTabKey>("discover");
  const [filters, setFilters] = useState<TabFiltersState>({
    discover: "全部",
    image_model: "全部",
    video_fx: "全部",
  });
  const [sorts, setSorts] = useState<TabSortsState>({
    discover: "推荐",
    image_model: "推荐",
    video_fx: "推荐",
  });
  const [activeDetail, setActiveDetail] = useState<IdeaDetailItem | null>(null);

  const itemsByTab = useMemo(
    () =>
      ({
        discover: getTabItems("discover"),
        image_model: getTabItems("image_model"),
        video_fx: getTabItems("video_fx"),
      }) satisfies Record<TabKey, IdeaItem[]>,
    []
  );

  const contentTabKey: TabKey =
    activeTopTab === "detail" ? (activeDetail?.sourceTab ?? "discover") : activeTopTab;
  const currentFilterTags = FILTER_TAGS_BY_TAB[contentTabKey] ?? FILTER_TAGS_BY_TAB.discover;
  const currentActiveFilter = filters[contentTabKey] ?? "全部";
  const currentSort = sorts[contentTabKey] ?? "推荐";
  const currentItems = itemsByTab[contentTabKey] ?? itemsByTab.discover;

  const visibleItems = useMemo(() => {
    const filtered =
      currentActiveFilter === "全部" ? currentItems : currentItems.filter((item) => item.tag === currentActiveFilter);
    if (currentSort === "最新") return [...filtered].reverse();
    return filtered;
  }, [currentActiveFilter, currentItems, currentSort]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-1">
          {TOP_TABS.map((tab) => {
            const active = activeTopTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTopTab(tab.key);
                }}
                className={`h-10 px-5 rounded-xl text-sm font-bold transition-colors ${
                  active ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {activeDetail ? (
            <div
              className={`h-10 rounded-xl transition-colors ${activeTopTab === "detail" ? "bg-white/10" : "hover:bg-white/5"}`}
            >
              <div className="h-full flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveTopTab("detail")}
                  className={`h-full pl-4 pr-2 rounded-l-xl text-sm font-bold transition-colors ${
                    activeTopTab === "detail" ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {activeDetail.title}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const backTab = activeDetail.sourceTab ?? "discover";
                    setActiveDetail(null);
                    setActiveTopTab(backTab);
                  }}
                  className={`h-full pr-3 pl-2 rounded-r-xl transition-colors ${
                    activeTopTab === "detail" ? "text-gray-200 hover:text-white" : "text-gray-400 hover:text-white"
                  }`}
                  aria-label="关闭详情页"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {activeTopTab === "detail" && activeDetail ? (
        <MediaDetailPage
          open={true}
          item={activeDetail}
          onClose={() => {
            const backTab = activeDetail.sourceTab ?? "discover";
            setActiveDetail(null);
            setActiveTopTab(backTab);
          }}
        />
      ) : (
        <InspirationGallery
          filterTags={currentFilterTags}
          activeFilter={currentActiveFilter}
          onChangeFilter={(value) => setFilters((prev) => ({ ...prev, [activeTopTab]: value }))}
          sort={currentSort}
          onChangeSort={(value) => setSorts((prev) => ({ ...prev, [activeTopTab]: value }))}
          items={visibleItems}
          onOpenDetail={(item) => {
            if (activeTopTab === "image_model" || activeTopTab === "video_fx") {
              setActiveDetail({ ...item, sourceTab: activeTopTab });
              setActiveTopTab("detail");
            }
          }}
        />
      )}
    </div>
  );
}
