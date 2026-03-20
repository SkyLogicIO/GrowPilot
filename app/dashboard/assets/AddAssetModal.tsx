"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { HelpCircle, Info, Link2, Plus, Upload, X } from "lucide-react";

export type AssetType = "image" | "video" | "link";

export interface UserAsset {
  id: string;
  name: string;
  description: string;
  scene: string;
  tags: string[];
  createdAt: number;
  type: AssetType;
  src: string;
}

const TYPES: readonly { key: AssetType; label: string }[] = [
  { key: "image", label: "图片" },
  { key: "video", label: "视频" },
  { key: "link", label: "链接" },
];

const SCENE_CONFIG = {
  电商: {
    guide: "拍摄指南：重点展示产品细节、使用场景及核心卖点；光线要充足，背景干净，避免干扰视线；可多角度拍摄（全景、特写）。",
    tags: ["新品上新", "产品细节", "促销活动", "直播切片", "开箱测评", "买家秀"],
  },
  幼教: {
    guide: "拍摄指南：建议采用低角度拍摄以平视儿童；捕捉互动瞬间而非摆拍；注意光线柔和；重点拍摄教学活动、游戏互动及午餐环节。",
    tags: ["室内教育", "户外活动", "亲子互动", "才艺展示", "公开课", "午餐时间"],
  },
  餐饮: {
    guide: "拍摄指南：利用暖色调灯光增加食欲感；特写拍摄食物纹理和热气腾腾的效果；展示制作过程和用餐环境；捕捉顾客满意的表情。",
    tags: ["招牌菜", "制作过程", "用餐环境", "顾客评价", "优惠套餐", "网红打卡"],
  },
  房产: {
    guide: "拍摄指南：使用广角镜头展示空间感；保持水平垂直；利用自然光；展示房屋布局、采光及周边配套；避免拍摄杂乱角落。",
    tags: ["样板间", "小区环境", "户型介绍", "周边配套", "签约现场", "看房日记"],
  },
  保险: {
    guide: "拍摄指南：场景需体现专业与信任感；着装正式；背景简洁（如办公室、书架）；拍摄理赔案例讲解或知识科普；保持眼神交流。",
    tags: ["知识科普", "理赔案例", "团队展示", "客户见证", "产品介绍", "早会分享"],
  },
  其他: {
    guide: "拍摄指南：保持画面清晰稳定，光线充足，主体突出；根据具体内容选择合适的背景和角度。",
    tags: ["日常记录", "活动花絮", "团队建设", "会议记录", "其他"],
  },
} as const;

type SceneKey = keyof typeof SCENE_CONFIG;

const makeId = (): string => `a_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export interface AddAssetModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (asset: UserAsset) => void;
}

export default function AddAssetModal({ open, onClose, onAdd }: AddAssetModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<AssetType>("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [scene, setScene] = useState<SceneKey>("电商");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const accept = useMemo(() => {
    if (type === "image") return "image/*";
    if (type === "video") return "video/*";
    return undefined;
  }, [type]);

  const currentSceneConfig = useMemo(() => SCENE_CONFIG[scene] ?? SCENE_CONFIG["其他"], [scene]);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setLinkUrl("");
    setFile(null);
    setType("image");
    setScene("电商");
    setTags([]);
    setTagInput("");
    setShowGuide(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (type === "link") {
      setFile(null);
      return;
    }
    setLinkUrl("");
  }, [open, type]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onClose();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((x) => x !== tag));
  };

  const handleTagInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  if (!open) return null;

  const submit = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedLinkUrl = linkUrl.trim();

    if (!trimmedTitle) return;

    const assetData = {
      id: makeId(),
      name: trimmedTitle,
      description: trimmedDescription,
      scene,
      tags,
      createdAt: Date.now(),
    };

    if (type === "link") {
      if (!trimmedLinkUrl) return;
      onAdd({
        ...assetData,
        type: "link",
        src: trimmedLinkUrl,
      });
      onClose();
      return;
    }

    if (file) {
      const src = URL.createObjectURL(file);
      onAdd({
        ...assetData,
        type,
        src,
      });
      onClose();
      return;
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center px-6" style={{ zIndex: 100000 }}>
      <div ref={rootRef} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-lg font-bold text-white">添加素材</div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
            aria-label="关闭"
          >
            <X size={18} className="text-gray-200" />
          </button>
        </div>

        <div className="p-6 space-y-5 min-h-[460px] overflow-y-auto max-h-[80vh]">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">素材类型</div>
            <div className="inline-flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-1">
              {TYPES.map((t) => {
                const active = type === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
                      active ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">拍摄场景</div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={scene}
                  onChange={(e) => setScene(e.target.value as SceneKey)}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  {(Object.keys(SCENE_CONFIG) as SceneKey[]).map((s) => (
                    <option key={s} value={s} className="bg-[#0F1115]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className={`h-11 px-4 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${
                  showGuide
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <HelpCircle size={16} />
                <span>拍摄指南</span>
              </button>
            </div>

            {showGuide && (
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                <Info size={18} className="text-blue-300 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-100 leading-relaxed">{currentSceneConfig.guide}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-white">素材标题</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="必填：例如‘门店海报’"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-white">素材说明</div>
              <div className="relative">
                <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="可选：例如‘用于门店引流’"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">素材标签</div>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="h-7 px-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-200 text-xs font-semibold flex items-center gap-1"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500 py-1.5">暂无标签，请从下方选择或输入</span>
              )}
            </div>

            <div className="relative">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="输入自定义标签，按回车添加"
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-gray-500 py-1">推荐标签（{scene}）：</span>
              {currentSceneConfig.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={tags.includes(tag)}
                  className={`h-6 px-2 rounded-md border text-xs font-medium transition-colors ${
                    tags.includes(tag)
                      ? "bg-white/10 border-white/10 text-gray-500 cursor-not-allowed"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Plus size={10} />
                    {tag}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {type === "link" ? (
              <>
                <div className="text-sm font-semibold text-white">链接</div>
                <div className="relative">
                  <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="必填：请输入 URL（http(s)）"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="text-xs text-gray-500">仅保存链接地址（无后端存储）。</div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-white">批量上传</div>
                <label className="flex items-center justify-between gap-3 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Upload size={16} className="text-gray-400" />
                    <span>{file ? file.name : "选择本地文件（图片/视频）"}</span>
                  </div>
                  <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                    }}
                  />
                </label>
                <div className="text-xs text-gray-500">仅用于本地展示（无后端存储）。</div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={submit}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-lg shadow-blue-500/20"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
