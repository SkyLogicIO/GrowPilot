"use client";

import { useState } from "react";
import { ImageIcon, Sparkles, LayoutTemplate } from "lucide-react";

// ─── 模板数据 ─────────────────────────────────────────────────────────

interface Template {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  aspectClass: string;
}

const GALLERY_TABS = [
  { key: "poster", label: "海报", icon: LayoutTemplate },
  { key: "scene", label: "场景图", icon: ImageIcon },
  { key: "product", label: "产品图", icon: Sparkles },
] as const;

type TabKey = (typeof GALLERY_TABS)[number]["key"];

const TEMPLATES: Record<TabKey, Template[]> = {
  poster: [
    { id: "poster-1", title: "PROMO SALE", subtitle: "促销海报 · 红金配色", imageUrl: "https://picsum.photos/id/11/720/1280", aspectClass: "aspect-[9/16]" },
    { id: "poster-2", title: "KNITWEAR", subtitle: "针织毛衣 · 服装展示", imageUrl: "https://picsum.photos/id/12/720/1280", aspectClass: "aspect-[9/16]" },
    { id: "poster-3", title: "TOY FUN", subtitle: "趣味玩具 · 儿童主题", imageUrl: "https://picsum.photos/id/13/720/1280", aspectClass: "aspect-[9/16]" },
    { id: "poster-4", title: "CAR TECH", subtitle: "车载配件 · 科技感", imageUrl: "https://picsum.photos/id/14/720/1280", aspectClass: "aspect-[9/16]" },
    { id: "poster-5", title: "AUTUMN VIBE", subtitle: "秋季时尚 · 街拍风格", imageUrl: "https://picsum.photos/id/15/720/1280", aspectClass: "aspect-[9/16]" },
    { id: "poster-6", title: "DIGITAL WALL", subtitle: "数码电子 · 展示墙", imageUrl: "https://picsum.photos/id/16/720/1280", aspectClass: "aspect-[9/16]" },
    { id: "poster-7", title: "BEAUTY SET", subtitle: "美妆个护 · 产品系列", imageUrl: "https://picsum.photos/id/17/720/1280", aspectClass: "aspect-[9/16]" },
    { id: "poster-8", title: "HOME COZY", subtitle: "温馨家居 · 暖光氛围", imageUrl: "https://picsum.photos/id/18/720/1280", aspectClass: "aspect-[9/16]" },
  ],
  scene: [
    { id: "scene-1", title: "LIVING ROOM", subtitle: "温馨客厅 · 自然光线", imageUrl: "https://picsum.photos/id/21/1200/900", aspectClass: "aspect-[4/3]" },
    { id: "scene-2", title: "CAMPING", subtitle: "户外露营 · 森林湖泊", imageUrl: "https://picsum.photos/id/22/1200/900", aspectClass: "aspect-[4/3]" },
    { id: "scene-3", title: "KITCHEN MODERN", subtitle: "现代厨房 · 不锈钢电器", imageUrl: "https://picsum.photos/id/23/1200/900", aspectClass: "aspect-[4/3]" },
    { id: "scene-4", title: "WORKSPACE", subtitle: "办公桌面 · 极简整洁", imageUrl: "https://picsum.photos/id/24/1200/900", aspectClass: "aspect-[4/3]" },
    { id: "scene-5", title: "FITNESS", subtitle: "健身房 · 专业器械", imageUrl: "https://picsum.photos/id/25/1200/900", aspectClass: "aspect-[4/3]" },
    { id: "scene-6", title: "CAFÉ CORNER", subtitle: "咖啡店 · 休闲角落", imageUrl: "https://picsum.photos/id/26/1200/900", aspectClass: "aspect-[4/3]" },
    { id: "scene-7", title: "PATIO GARDEN", subtitle: "花园露台 · 绿植环绕", imageUrl: "https://picsum.photos/id/27/1200/900", aspectClass: "aspect-[4/3]" },
    { id: "scene-8", title: "READING NOOK", subtitle: "书房角落 · 温暖安静", imageUrl: "https://picsum.photos/id/28/1200/900", aspectClass: "aspect-[4/3]" },
  ],
  product: [
    { id: "product-1", title: "WATCH", subtitle: "智能手表 · 产品特写", imageUrl: "https://picsum.photos/id/31/1280/720", aspectClass: "aspect-[16/9]" },
    { id: "product-2", title: "HANDBAG", subtitle: "真皮手提包 · 质感拍摄", imageUrl: "https://picsum.photos/id/32/1280/720", aspectClass: "aspect-[16/9]" },
    { id: "product-3", title: "EARBUDS", subtitle: "无线耳机 · 极简风格", imageUrl: "https://picsum.photos/id/33/1280/720", aspectClass: "aspect-[16/9]" },
    { id: "product-4", title: "SERUM", subtitle: "护肤精华 · 产品瓶身", imageUrl: "https://picsum.photos/id/34/1280/720", aspectClass: "aspect-[16/9]" },
    { id: "product-5", title: "KEYBOARD", subtitle: "机械键盘 · RGB 灯效", imageUrl: "https://picsum.photos/id/35/1280/720", aspectClass: "aspect-[16/9]" },
    { id: "product-6", title: "SUNGLASSES", subtitle: "时尚太阳镜 · 产品拍摄", imageUrl: "https://picsum.photos/id/36/1280/720", aspectClass: "aspect-[16/9]" },
    { id: "product-7", title: "MUG CERAMIC", subtitle: "手工陶瓷杯 · 咖啡时光", imageUrl: "https://picsum.photos/id/37/1280/720", aspectClass: "aspect-[16/9]" },
    { id: "product-8", title: "SNEAKER", subtitle: "复古运动鞋 · 白绿配色", imageUrl: "https://picsum.photos/id/38/1280/720", aspectClass: "aspect-[16/9]" },
  ],
};

// ─── 模板卡片 ─────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onSelect,
}: {
  template: Template;
  onSelect: (t: Template) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className="group w-full rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:bg-white/[0.05] hover:border-white/[0.12] transition-all text-left"
    >
      <div className={`${template.aspectClass} overflow-hidden bg-white/[0.02] relative`}>
        {!loaded && <div className="absolute inset-0 shimmer" />}
        <img
          src={template.imageUrl}
          alt={template.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="px-3 py-2.5">
        <div className="text-xs font-bold text-text-primary truncate">{template.title}</div>
        <div className="text-[11px] text-text-muted truncate mt-0.5">{template.subtitle}</div>
      </div>
    </button>
  );
}

// ─── 画廊主体 ─────────────────────────────────────────────────────────

export interface SellingPointTemplate {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export default function SellingPointGallery({
  onSelect,
}: {
  onSelect: (template: SellingPointTemplate) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("poster");
  const templates = TEMPLATES[activeTab];

  return (
    <div className="flex flex-col h-full">
      {/* Tab 栏 */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06] shrink-0">
        <h2 className="text-sm font-bold text-text-primary mb-3">选择模板</h2>
        <div className="flex items-center gap-1">
          {GALLERY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-accent/12 text-accent border border-accent/20"
                    : "text-text-muted hover:text-text-secondary hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 模板网格 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onSelect={() =>
                onSelect({
                  id: t.id,
                  title: t.title,
                  subtitle: t.subtitle,
                  imageUrl: t.imageUrl,
                })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
