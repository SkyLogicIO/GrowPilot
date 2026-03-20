
"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Upload, Wand2, Loader2, Download } from "lucide-react";

type ImageEditModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ImageEditModal({ open, onClose }: ImageEditModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState(-1);
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image3, setImage3] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string>("");
  const [image2Preview, setImage2Preview] = useState<string>("");
  const [image3Preview, setImage3Preview] = useState<string>("");
  const [resultImage, setResultImage] = useState<string>("");

  const image1Ref = useRef<HTMLInputElement>(null);
  const image2Ref = useRef<HTMLInputElement>(null);
  const image3Ref = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setPrompt("");
      setNegativePrompt("");
      setSeed(-1);
      setImage1(null);
      setImage2(null);
      setImage3(null);
      setImage1Preview("");
      setImage2Preview("");
      setImage3Preview("");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: 1 | 2 | 3) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (index === 1) {
      setImage1(file);
      setImage1Preview(URL.createObjectURL(file));
    } else if (index === 2) {
      setImage2(file);
      setImage2Preview(URL.createObjectURL(file));
    } else {
      setImage3(file);
      setImage3Preview(URL.createObjectURL(file));
    }
    // Clear previous result when input changes
    setResultImage("");
  };

  const handleGenerate = async () => {
    if (!prompt) {
      alert("请输入编辑提示词");
      return;
    }
    if (!image1) {
      alert("请至少上传第一张图片");
      return;
    }
    setIsGenerating(true);
    setResultImage(""); // Clear previous result

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (negativePrompt) formData.append("negative_prompt", negativePrompt);
      formData.append("seed", seed.toString());
      
      formData.append("image1", image1, image1.name);
      if (image2) formData.append("image2", image2, image2.name);
      if (image3) formData.append("image3", image3, image3.name);

      const response = await fetch("/api/proxy/imageedit", {
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
    } catch (error: any) {
      console.error("Image edit failed:", error);
      alert(`编辑失败：${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("下载失败，请重试");
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">通用图像编辑</div>
              <div className="text-xs text-gray-400">智能识别图片内容，根据提示词进行编辑</div>
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
              {/* Text Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">提示词 (Prompt)</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述你想如何编辑这张图片..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">负面提示词 (Negative Prompt) <span className="text-gray-500 font-normal">(可选)</span></label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="不希望出现的内容..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">随机种子 (Seed) <span className="text-gray-500 font-normal">(-1为随机)</span></label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
              </div>

              {/* Image Uploads */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">图片上传 (支持1-3张)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Image 1 */}
                    <div
                      onClick={() => !isGenerating && image1Ref.current?.click()}
                      className={`relative aspect-square rounded-xl border border-dashed ${
                        image1Preview ? "border-blue-500/50" : "border-white/20"
                      } bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                    >
                      {image1Preview ? (
                        <img src={image1Preview} alt="Img 1" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={20} className="text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-500">图片1(必填)</span>
                        </div>
                      )}
                      <input ref={image1Ref} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 1)} disabled={isGenerating} />
                    </div>

                    {/* Image 2 */}
                    <div
                      onClick={() => !isGenerating && image2Ref.current?.click()}
                      className={`relative aspect-square rounded-xl border border-dashed ${
                        image2Preview ? "border-blue-500/50" : "border-white/20"
                      } bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                    >
                      {image2Preview ? (
                        <img src={image2Preview} alt="Img 2" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={20} className="text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-500">图片2(选填)</span>
                        </div>
                      )}
                      <input ref={image2Ref} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 2)} disabled={isGenerating} />
                    </div>

                    {/* Image 3 */}
                    <div
                      onClick={() => !isGenerating && image3Ref.current?.click()}
                      className={`relative aspect-square rounded-xl border border-dashed ${
                        image3Preview ? "border-blue-500/50" : "border-white/20"
                      } bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}
                    >
                      {image3Preview ? (
                        <img src={image3Preview} alt="Img 3" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={20} className="text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-500">图片3(选填)</span>
                        </div>
                      )}
                      <input ref={image3Ref} type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, 3)} disabled={isGenerating} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt || !image1}
                className={`w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                  isGenerating || !prompt || !image1
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25"
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
            <div className="bg-black/20 rounded-2xl border border-white/5 p-4 flex flex-col h-[500px]">
              <div className="text-sm font-medium text-gray-300 mb-3 flex items-center justify-between">
                <span>生成结果</span>
                {resultImage && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-white"
                  >
                    <Download size={14} />
                    下载图片
                  </button>
                )}
              </div>
              
              <div className="flex-1 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                {resultImage ? (
                  <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
                ) : isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={24} className="text-blue-500 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm animate-pulse">正在处理图片...</p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Wand2 size={32} className="text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">生成的图片将显示在这里</p>
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
