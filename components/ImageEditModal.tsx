"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Upload, Wand2, Loader2, Download } from "lucide-react";
import { editImages } from "@/lib/ai";

type ImageEditModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ImageEditModal({ open, onClose }: ImageEditModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [resultImage, setResultImage] = useState<string>("");

  const imageRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setPrompt("");
      setNegativePrompt("");
      setImage(null);
      setImagePreview("");
      setResultImage("");
      setIsGenerating(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      if (!isGenerating) onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!isGenerating) onClose();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isGenerating, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResultImage("");
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !image) return;

    setIsGenerating(true);
    setResultImage("");

    try {
      const result = await editImages({
        prompt,
        negativePrompt: negativePrompt || undefined,
        images: [image],
      });
      setResultImage(result.imageUrl);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "未知错误";
      alert(`编辑失败：${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = `edited-image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center px-6 pl-64" style={{ zIndex: 100000 }}>
      <div
        ref={rootRef}
        className="w-full max-w-4xl bg-surface border-2 border-border shadow-[6px_6px_0px_#1A1A1A] rounded-xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-up"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C77DFF] border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
              <Wand2 size={20} className="text-text-primary" />
            </div>
            <div>
              <div className="text-lg font-black text-text-primary">通用图像编辑</div>
              <div className="text-xs text-text-secondary">智能识别图片内容，根据提示词进行编辑</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="w-10 h-10 rounded-xl bg-surface border-2 border-border shadow-[2px_2px_0px_#1A1A1A] hover:bg-surface-hover transition-colors flex items-center justify-center active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A]"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
              {/* Text Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">提示词 (Prompt)</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述你想如何编辑这张图片..."
                    className="w-full h-24 bg-surface-hover border-2 border-border rounded-xl p-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">
                    负面提示词 <span className="text-text-muted font-medium">(可选)</span>
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="不希望出现的内容..."
                    className="w-full bg-surface-hover border-2 border-border rounded-xl px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">上传图片</label>
                <div
                  onClick={() => !isGenerating && imageRef.current?.click()}
                  className={`relative aspect-[4/3] rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                    imagePreview ? "border-accent bg-accent/5" : "border-border bg-surface-hover hover:bg-surface"
                  }`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Input" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-surface border-2 border-border shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center mb-3">
                        <Upload size={24} className="text-text-muted" />
                      </div>
                      <span className="text-sm text-text-muted">点击上传图片</span>
                    </div>
                  )}
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt || !image}
                className={`w-full h-12 brut-btn text-white flex items-center justify-center gap-2 ${
                  isGenerating || !prompt || !image
                    ? "bg-text-muted cursor-not-allowed"
                    : "bg-[#83b7f9]"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>正在生成中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>开始生成</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Result */}
            <div className="bg-surface-hover rounded-xl p-4 flex flex-col h-[500px]">
              <div className="text-sm font-bold text-text-secondary mb-3 flex items-center justify-between">
                <span>生成结果</span>
                {resultImage && (
                  <button
                    onClick={handleDownload}
                    className="brut-btn bg-surface text-text-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    下载图片
                  </button>
                )}
              </div>

              <div className="flex-1 rounded-xl bg-surface border-2 border-border flex items-center justify-center overflow-hidden relative">
                {resultImage ? (
                  <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
                ) : isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-border border-t-accent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={24} className="text-accent animate-pulse" />
                      </div>
                    </div>
                    <p className="text-text-muted text-sm animate-pulse">生成中...</p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-xl bg-[#C77DFF]/15 border-2 border-border flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_#1A1A1A]">
                      <Wand2 size={28} className="text-text-muted" />
                    </div>
                    <p className="text-text-muted text-sm">生成的图片将显示在这里</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
