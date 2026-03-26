"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Upload, Wand2, Loader2, Download } from "lucide-react";

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

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setPrompt("");
      setInputImage(null);
      setInputImagePreview("");
      setResultImage("");
      setIsGenerating(false);
    }
  }, [open]);

  // Close on outside click
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
    if (!prompt) {
      alert("请输入背景描述");
      return;
    }
    if (!inputImage) {
      alert("请上传图片");
      return;
    }

    // 获取 API Key
    const apiKey = window.localStorage.getItem("gemini_api_key")?.trim();
    if (!apiKey) {
      alert("请先设置 Gemini API Key");
      return;
    }

    setIsGenerating(true);
    setResultImage("");

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("image", inputImage, inputImage.name);
      formData.append("api_key", apiKey);

      const response = await fetch("/api/proxy/text2img", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.image_url) {
        throw new Error(data.error || "生成失败");
      }

      setResultImage(data.image_url);
    } catch (error: unknown) {
      console.error("Background replace failed:", error);
      const message = error instanceof Error ? error.message : "未知错误";
      alert(`换背景失败：${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6" style={{ zIndex: 100000 }}>
      <div
        ref={rootRef}
        className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0F1115] shadow-2xl ring-1 ring-white/10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">换背景</div>
              <div className="text-xs text-gray-400">上传图片，描述新背景，一键替换</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            <X size={18} className="text-gray-200" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">上传图片</label>
                <div
                  onClick={() => !isGenerating && inputImageRef.current?.click()}
                  className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed ${
                    inputImagePreview ? "border-blue-500/50" : "border-white/20"
                  } bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                >
                  {inputImagePreview ? (
                    <img src={inputImagePreview} alt="Input" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-gray-300" />
                      </div>
                      <span className="text-sm text-gray-400">点击上传图片</span>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">新背景描述</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想要的背景，例如：蓝天白云下的草原、现代都市夜景、温馨的咖啡厅..."
                  className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm"
                />
              </div>
            </div>

            {/* Right Column: Result */}
            <div className="space-y-6 flex flex-col">
              <label className="block text-sm font-medium text-gray-300 mb-2">生成结果</label>
              <div className="flex-1 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-center relative overflow-hidden min-h-[300px]">
                {resultImage ? (
                  <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
                ) : isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-green-500 animate-spin" />
                    <span className="text-gray-400 text-sm">正在生成新背景...</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm text-center px-4">
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
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
                >
                  <Download size={18} />
                  下载结果
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-white/10 flex justify-end gap-3 shrink-0 bg-[#0F1115]">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || !inputImage}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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
