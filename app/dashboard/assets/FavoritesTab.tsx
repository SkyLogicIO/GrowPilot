"use client";

import type { ReactNode } from "react";
import type { UserAsset } from "./AddAssetModal";

export interface FavoriteTemplateItem {
  id: string;
  cover: string;
  title: string;
  subtitle: string;
}

export interface RenderCardArgs {
  key: string;
  cover: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export interface RenderActionsArgs {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onMore: () => void;
}

export interface FavoritesTabProps {
  activeTag: string;
  onSelectRecent: () => void;
  categoryOptions: string[];
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
  orientationOptions: string[];
  activeOrientation: string;
  onChangeOrientation: (value: string) => void;
  onOpenAddAsset: () => void;
  templates: FavoriteTemplateItem[];
  assets: UserAsset[];
  favoriteTemplateIds: Set<string>;
  onToggleTemplateFavorite: (id: string) => void;
  onShareTemplate: (id: string) => void;
  favoriteAssetIds: Set<string>;
  onToggleAssetFavorite: (id: string) => void;
  onShareAsset: (id: string) => void;
  renderCard: (args: RenderCardArgs) => ReactNode;
  renderActions: (args: RenderActionsArgs) => ReactNode;
}

export default function FavoritesTab({
  activeTag,
  onSelectRecent,
  categoryOptions,
  selectedCategory,
  onSelectCategory,
  orientationOptions,
  activeOrientation,
  onChangeOrientation,
  onOpenAddAsset: _onOpenAddAsset,
  templates,
  assets,
  favoriteTemplateIds,
  onToggleTemplateFavorite,
  onShareTemplate,
  favoriteAssetIds,
  onToggleAssetFavorite,
  onShareAsset,
  renderCard,
  renderActions,
}: FavoritesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSelectRecent}
            className={`h-9 px-4 rounded-full border text-sm font-semibold transition-colors ${
              activeTag === "推荐"
                ? "bg-white text-[#0F1115] border-white"
                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
            }`}
          >
            最近收藏
          </button>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-300">筛选</div>

          <div className="h-9 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="h-9 px-4 bg-transparent text-gray-200 text-sm font-semibold focus:outline-none"
            >
              {categoryOptions.map((item) => (
                <option key={item} value={item} className="bg-[#0F1115]">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="h-9 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <select
              value={activeOrientation}
              onChange={(e) => onChangeOrientation(e.target.value)}
              className="h-9 px-4 bg-transparent text-gray-200 text-sm font-semibold focus:outline-none"
            >
              {orientationOptions.map((item) => (
                <option key={item} value={item} className="bg-[#0F1115]">
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((item) =>
          renderCard({
            key: item.id,
            cover: item.cover,
            title: item.title,
            subtitle: item.subtitle,
            children: renderActions({
              isFavorite: favoriteTemplateIds.has(item.id),
              onToggleFavorite: () => onToggleTemplateFavorite(item.id),
              onShare: () => onShareTemplate(item.id),
              onMore: () => {},
            }),
          })
        )}
      </div>

      {assets.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.map((asset) => {
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
                    onToggleFavorite: () => onToggleAssetFavorite(asset.id),
                    onShare: () => onShareAsset(asset.id),
                    onMore: () => {},
                  })}
                  {asset.type === "video" ? (
                    <div className="absolute inset-0">
                      <video src={asset.src} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
                    </div>
                  ) : null}
                </>
              ),
            });
          })}
        </div>
      ) : null}
    </div>
  );
}
