"use client";

import { useRef, useState } from "react";
import { Plus, Loader2, Zap, SlidersHorizontal, AlertCircle, Info } from "lucide-react";

export interface ImageGenerationParams {
  prompt: string;
  name: string;
  model: string;
  ratio: string;
  count: string;
  inputImage?: File | null;
}

export interface ImageGenerationResult {
  id: number;
  name: string;
  updatedAt: string;
  cover: string;
  statusText: string;
  mode: string;
  prompt: string;
  attachments: Array<{
    type: string;
    src: string;
    content: string;
    name: string;
  }>;
}

interface ImageGenerationFormProps {
  isGenerating: boolean;
  onGenerate: (params: ImageGenerationParams) => Promise<ImageGenerationResult>;
}

export default function ImageGenerationForm({ isGenerating, onGenerate }: ImageGenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string>("");
  const [imageModel] = useState("auto");
  const [imageRatio] = useState("3:4");
  const [imageCount] = useState("4张");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInputImage(file);
    setInputImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    try {
      await onGenerate({
        prompt,
        name: "",
        model: imageModel,
        ratio: imageRatio,
        count: imageCount,
        inputImage,
      });
    } catch (error: any) {
      setErrorMessage(error.message || "图片生成失败，请重试");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Error Message Display */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border-2 border-border">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-bold text-red-400 mb-1">生成失败</div>
            <div className="text-sm text-text-secondary whitespace-pre-wrap">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Info Banner - Only show when generating */}
      {isGenerating && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border-2 border-border">
          <Info size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-bold text-text-secondary mb-1">图片生成中</div>
            <div className="text-sm text-text-secondary">
              正在生成图片，请稍候...
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
        {/* 上传参考图 */}
        <div
          onClick={() => !isGenerating && fileInputRef.current?.click()}
          className={`h-[180px] rounded-xl border-2 border-dashed ${
            inputImagePreview ? "border-accent/50 bg-accent/5" : "border-border bg-surface"
          } hover:bg-surface-hover transition-colors flex flex-col items-center justify-center ${
            isGenerating ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } overflow-hidden group relative`}
        >
          {inputImagePreview ? (
            <>
              <img src={inputImagePreview} alt="Preview" className="w-full h-full object-cover" />
              {!isGenerating && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">点击更换</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-surface-hover border-2 border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={20} className="text-text-secondary" />
              </div>
              <div className="mt-3 text-sm font-bold text-text-secondary">添加参考图</div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
            disabled={isGenerating}
          />
        </div>

        {/* 输入框 */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请输入你的创作需求或广告文案描述…"
          disabled={isGenerating}
          className="h-[180px] w-full resize-none rounded-xl bg-surface border-2 border-border px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
        />
      </div>

      {/* Image Parameters */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-medium">模型:</span>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border-2 border-border text-xs text-text-primary font-medium">
            {imageModel}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-medium">比例:</span>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border-2 border-border text-xs text-text-primary font-medium">
            {imageRatio}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-medium">数量:</span>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border-2 border-border text-xs text-text-primary font-medium">
            {imageCount}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={isGenerating}
          className="w-10 h-10 rounded-xl border-2 border-border hover:bg-surface-hover transition-colors flex items-center justify-center disabled:opacity-50"
        >
          <SlidersHorizontal size={18} className="text-text-secondary" />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isGenerating || (!prompt.trim() && !inputImage)}
          className="brut-btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Zap size={18} />
              生成
            </>
          )}
        </button>
      </div>
    </div>
  );
}
