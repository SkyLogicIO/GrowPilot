"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Upload, RefreshCcw, Loader2, Download } from "lucide-react";

type FaceSwapModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function FaceSwapModal({ open, onClose }: FaceSwapModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string>("");
  const [sourceImagePreview, setSourceImagePreview] = useState<string>("");
  const [resultImage, setResultImage] = useState<string>("");
  
  const inputImageRef = useRef<HTMLInputElement>(null);
  const sourceImageRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setInputImage(null);
      setSourceImage(null);
      setInputImagePreview("");
      setSourceImagePreview("");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "input" | "source") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "input") {
      setInputImage(file);
      setInputImagePreview(URL.createObjectURL(file));
    } else {
      setSourceImage(file);
      setSourceImagePreview(URL.createObjectURL(file));
    }
    // Clear previous result when input changes
    setResultImage("");
  };

  const handleGenerate = async () => {
    if (!inputImage || !sourceImage) {
      alert("请上传两张图片");
      return;
    }
    setIsGenerating(true);
    setResultImage(""); // Clear previous result

    try {
      const formData = new FormData();
      formData.append("input_image", inputImage, inputImage.name);
      formData.append("source_image", sourceImage, sourceImage.name);

      const response = await fetch("/api/proxy/faceswap", {
        method: "POST",
        headers: {
          "Accept": "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const imageUrl = data.image_url.startsWith("http")
        ? data.image_url
        : `http://175.27.193.51:3008${data.image_url}`;

      setResultImage(imageUrl);
      
      // We could also create a project here if needed, but for now we just show the result
    } catch (error: any) {
      console.error("Faceswap failed:", error);
      alert(`换脸失败：${error.message}`);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <RefreshCcw size={20} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">AI 换脸</div>
              <div className="text-xs text-gray-400">上传图片，一键生成换脸效果</div>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">1. 上传被换脸图片 (底图)</label>
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
                    onChange={(e) => handleFileChange(e, "input")}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">2. 上传源脸部图片 (提供五官)</label>
                <div
                  onClick={() => !isGenerating && sourceImageRef.current?.click()}
                  className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed ${
                    sourceImagePreview ? "border-blue-500/50" : "border-white/20"
                  } bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                >
                  {sourceImagePreview ? (
                    <img src={sourceImagePreview} alt="Source" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-gray-300" />
                      </div>
                      <span className="text-sm text-gray-400">点击上传图片</span>
                    </>
                  )}
                  <input
                    ref={sourceImageRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleFileChange(e, "source")}
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Result */}
            <div className="space-y-6 flex flex-col">
              <label className="block text-sm font-medium text-gray-300 mb-2">3. 生成结果</label>
              <div className="flex-1 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-center relative overflow-hidden min-h-[300px]">
                {resultImage ? (
                  <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
                ) : isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-blue-500 animate-spin" />
                    <span className="text-gray-400 text-sm">正在智能换脸中...</span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm text-center px-4">
                    点击下方按钮开始生成<br/>结果将显示在这里
                  </div>
                )}
              </div>
              
              {resultImage && (
                 <a 
                   href={resultImage} 
                   download="faceswap_result.png"
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
            disabled={isGenerating || !inputImage || !sourceImage}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                立即换脸
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
