export type IdeaMediaType = "image" | "video";

export type TabKey = "discover" | "image_model" | "video_fx";

export interface IdeaItem {
  id: string;
  type: IdeaMediaType;
  tag: string;
  title: string;
  cover: string;
}

export interface IdeaDetailItem extends IdeaItem {
  sourceTab?: TabKey;
}

export const TOP_TABS: { key: TabKey; label: string }[] = [
  { key: "image_model", label: "图片模型" },
  { key: "video_fx", label: "视频特效" },
  { key: "discover", label: "收藏的灵感" },
];

export const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=900&q=80";

export const FILTER_TAGS_BY_TAB: Record<TabKey, string[]> = {
  discover: [
    "全部",
    "重生之我在L站接视频",
    "广告·电商·视频特效",
    "精选·图片模板",
    "VLOG·视频特效",
    "短剧/漫画剧·视频特效",
    "摄影写真",
    "电商",
  ],
  image_model: ["全部", "海报", "电商主图", "节日热点", "人物写真", "品牌KV", "UI素材", "字体排版"],
  video_fx: ["全部", "转场", "字幕", "氛围", "特写", "AI抠像", "复古", "胶片"],
};

const buildDiscoverItems = (): IdeaItem[] => [
  {
    id: "discover_1",
    type: "image",
    tag: "精选·图片模板",
    title: "圣诞海报灵感",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_2",
    type: "image",
    tag: "精选·图片模板",
    title: "雪景排版风格",
    cover: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_3",
    type: "image",
    tag: "电商",
    title: "新品上新封面",
    cover: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_4",
    type: "image",
    tag: "电商",
    title: "电商素材拼贴",
    cover: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_5",
    type: "image",
    tag: "精选·图片模板",
    title: "质感封面风格",
    cover: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_6",
    type: "video",
    tag: "VLOG·视频特效",
    title: "镜头运动参考",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_7",
    type: "image",
    tag: "精选·图片模板",
    title: "节日KV配色",
    cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_8",
    type: "image",
    tag: "电商",
    title: "产品陈列灵感",
    cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_9",
    type: "image",
    tag: "精选·图片模板",
    title: "科技感背景",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_10",
    type: "image",
    tag: "摄影写真",
    title: "办公场景素材",
    cover: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_11",
    type: "image",
    tag: "电商",
    title: "门店引流排版",
    cover: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discover_12",
    type: "image",
    tag: "精选·图片模板",
    title: "科普封面参考",
    cover: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
  },
];

const buildImageModelItems = (): IdeaItem[] => [
  {
    id: "img_model_1",
    type: "image",
    tag: "电商主图",
    title: "电商主图·质感灯光",
    cover: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_2",
    type: "image",
    tag: "海报",
    title: "海报·大标题排版",
    cover: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_3",
    type: "image",
    tag: "品牌KV",
    title: "品牌KV·渐变质感",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_4",
    type: "image",
    tag: "人物写真",
    title: "人物写真·氛围人像",
    cover: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_5",
    type: "image",
    tag: "节日热点",
    title: "节日热点·红绿配色",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_6",
    type: "image",
    tag: "UI素材",
    title: "UI素材·简洁卡片",
    cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_7",
    type: "image",
    tag: "字体排版",
    title: "字体排版·留白海报",
    cover: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_8",
    type: "image",
    tag: "电商主图",
    title: "电商主图·组合陈列",
    cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_9",
    type: "image",
    tag: "海报",
    title: "海报·电影感构图",
    cover: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_10",
    type: "image",
    tag: "品牌KV",
    title: "品牌KV·材质背景",
    cover: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_11",
    type: "image",
    tag: "人物写真",
    title: "人物写真·棚拍风",
    cover: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "img_model_12",
    type: "image",
    tag: "节日热点",
    title: "节日热点·雪景字效",
    cover: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
  },
];

const buildVideoFxItems = (): IdeaItem[] => [
  {
    id: "video_fx_1",
    type: "video",
    tag: "转场",
    title: "转场·拉镜头",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_2",
    type: "video",
    tag: "字幕",
    title: "字幕·节奏卡点",
    cover: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_3",
    type: "video",
    tag: "氛围",
    title: "氛围·霓虹光",
    cover: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_4",
    type: "video",
    tag: "特写",
    title: "特写·产品质感",
    cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_5",
    type: "video",
    tag: "AI抠像",
    title: "AI抠像·人物出场",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_6",
    type: "video",
    tag: "复古",
    title: "复古·胶片漏光",
    cover: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_7",
    type: "video",
    tag: "胶片",
    title: "胶片·颗粒噪点",
    cover: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_8",
    type: "video",
    tag: "转场",
    title: "转场·闪白",
    cover: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_9",
    type: "video",
    tag: "字幕",
    title: "字幕·逐字出现",
    cover: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_10",
    type: "video",
    tag: "氛围",
    title: "氛围·雪花飘落",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_11",
    type: "video",
    tag: "特写",
    title: "特写·镜头摇移",
    cover: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "video_fx_12",
    type: "video",
    tag: "AI抠像",
    title: "AI抠像·背景替换",
    cover: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
  },
];

export function getTabItems(key: TabKey): IdeaItem[] {
  if (key === "image_model") return buildImageModelItems();
  if (key === "video_fx") return buildVideoFxItems();
  return buildDiscoverItems();
}
