"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Upload, Wand2, Loader2, Download } from "lucide-react";
import { uploadFile } from "@/lib/api/files";
import { imageToImage } from "@/lib/api/ai-tools";
import { editImage, getAuthToken } from "@/lib/ai";
import { useTaskPolling } from "@/hooks/useTaskPolling";

type BackgroundReplaceModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function BackgroundReplaceModal({ open, onClose }: BackgroundReplaceModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string>("");
  const [resultImage, setResultImage] = useState<string>("");

  const inputImageRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const polling = useTaskPolling();

  useEffect(() => {
    if (open) {
      setPrompt("");
      setInputImage(null);
      setInputImagePreview("");
      setResultImage("");
      setIsGenerating(false);
      polling.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听轮询结果
  useEffect(() => {
    if (!polling.task) return;
    if (polling.task.status === "completed") {
      setResultImage(polling.task.result_url || "");
      setIsGenerating(false);
      polling.reset();
    } else if (polling.task.status === "failed") {
      alert(polling.task.error || "任务执行失败");
      setIsGenerating(false);
      polling.reset();
    }
  }, [polling.task]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setInputImage(file);
    setInputImagePreview(URL.createObjectURL(file));
    setResultImage("");
  };

  const handleGenerate = async () => {
    if (!prompt || !inputImage) return;

    setIsGenerating(true);
    setResultImage("");

    try {
      // 优先走后端 API
      const imageUrl = await uploadFile(inputImage, "tools");
      const taskInfo = await imageToImage({
        image_url: imageUrl,
        prompt,
        model_name: "auto",
      });
      polling.start(taskInfo.task_id);
    } catch (backendError: unknown) {
      // ai-tools 路径失败，fallback 到 GenAI 代理
      console.warn("ai-tools image-to-image failed, falling back to GenAI proxy:", backendError);

      if (!getAuthToken()) {
        alert("请先登录后再使用 AI 功能");
        setIsGenerating(false);
        return;
      }

      try {
        const result = await editImage({ prompt, image: inputImage });
        setResultImage(result.imageUrl);
        setIsGenerating(false);
      } catch (sdkError: unknown) {
        console.error("SDK fallback also failed:", sdkError);
        const message = sdkError instanceof Error ? sdkError.message : "未知错误";
        alert(`换背景失败：${message}`);
        setIsGenerating(false);
      }
    }
  };

  if (!open) return null;

  const progress = polling.task?.progress ?? 0;
  const statusText = polling.task?.status === "pending" ? "排队中" : "处理中";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center px-6 pl-64" style={{ zIndex: 100000 }}>
      <div
        ref={rootRef}
        className="w-full max-w-4xl bg-surface border-2 border-border shadow-[6px_6px_0px_#1A1A1A] rounded-xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-up"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4ECDC4] border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
              <Wand2 size={20} className="text-text-primary" />
            </div>
            <div>
              <div className="text-lg font-black text-text-primary">换背景</div>
              <div className="text-xs text-text-secondary">上传图片，描述新背景，一键替换</div>
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
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">上传图片</label>
                <div
                  onClick={() => !isGenerating && inputImageRef.current?.click()}
                  className={`relative aspect-[4/3] rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                    inputImagePreview ? "border-accent bg-accent/5" : "border-border bg-surface-hover hover:bg-surface"
                  }`}
                >
                  {inputImagePreview ? (
                    <img src={inputImagePreview} alt="Input" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-surface border-2 border-border shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center mb-3">
                        <Upload size={24} className="text-text-muted" />
                      </div>
                      <span className="text-sm text-text-muted">点击上传图片</span>
                    </>
                  )}
                  <input
                    ref={inputImageRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">新背景描述</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想要的背景，例如：蓝天白云下的草原、现代都市夜景、温馨的咖啡厅..."
                  className="w-full h-28 bg-surface-hover border-2 border-border rounded-xl p-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none text-sm"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 flex flex-col">
              <label className="block text-sm font-bold text-text-secondary mb-2">生成结果</label>
              <div className="flex-1 rounded-xl bg-surface-hover border-2 border-border flex items-center justify-center relative overflow-hidden min-h-[300px]">
                {resultImage ? (
                  <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
                ) : isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-[#4ECDC4] animate-spin" />
                    <span className="text-text-muted text-sm">
                      {statusText} {progress > 0 ? `${progress}%` : "..."}
                    </span>
                  </div>
                ) : (
                  <div className="text-text-muted text-sm text-center px-4">
                    上传图片并描述背景<br/>点击下方按钮开始生成
                  </div>
                )}
              </div>

              {resultImage && (
                <a
                  href={resultImage}
                  download="background_replaced.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brut-btn bg-surface text-text-primary flex items-center justify-center gap-2 w-full py-3 text-sm"
                >
                  <Download size={18} />
                  下载结果
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t-2 border-border flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="brut-btn bg-surface text-text-secondary px-6 py-2.5"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || !inputImage}
            className={`brut-btn px-8 py-2.5 text-white flex items-center gap-2 ${
              isGenerating || !prompt || !inputImage
                ? "bg-text-muted cursor-not-allowed"
                : "bg-[#4ECDC4]"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                开始替换
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
