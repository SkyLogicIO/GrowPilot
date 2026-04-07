"use client";

import { useRef, useState } from "react";
import { Plus, Loader2, Zap, SlidersHorizontal, AlertCircle, Info } from "lucide-react";

export interface VideoGenerationParams {
  prompt: string;
  name: string;
  model: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  inputImage?: File | null;
}

export interface VideoGenerationResult {
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

interface VideoGenerationFormProps {
  isGenerating: boolean;
  onGenerate: (params: VideoGenerationParams) => Promise<VideoGenerationResult>;
}

export default function VideoGenerationForm({ isGenerating, onGenerate }: VideoGenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string>("");
  const [videoModel, setVideoModel] = useState<string>("auto");
  const [videoDuration, setVideoDuration] = useState<number>(8);
  const [videoResolution, setVideoResolution] = useState<string>("720p");
  const [videoAspectRatio, setVideoAspectRatio] = useState<string>("16:9");
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
        model: videoModel,
        duration: videoDuration,
        resolution: videoResolution,
        aspectRatio: videoAspectRatio,
        inputImage,
      });
    } catch (error: any) {
      setErrorMessage(error.message || "视频生成失败，请重试");
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
            <div className="text-sm font-bold text-text-secondary mb-1">视频生成中</div>
            <div className="text-sm text-text-secondary">
              正在生成 {videoDuration}秒 {videoResolution} {videoAspectRatio} 视频，
              通常需要 1-3 分钟，每 5 秒自动刷新状态...
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
          placeholder="请输入你的视频创作需求或广告文案描述…"
          disabled={isGenerating}
          className="h-[180px] w-full resize-none rounded-xl bg-surface border-2 border-border px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
        />
      </div>

      {/* Video Parameters */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {/* 视频模型选择 */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-medium">模型:</span>
          <select
            value={videoModel}
            onChange={(e) => setVideoModel(e.target.value)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg bg-surface border-2 border-border text-text-primary text-xs focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer"
          >
            <option value="auto">Auto (推荐)</option>
            <option value="t2v-gemini">Gemini T2V</option>
          </select>
        </div>

        {/* 视频时长 */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-medium">时长:</span>
          <div className="flex gap-1">
            {[4, 6, 8].map(d => (
              <label key={d} className={`px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-colors font-medium ${videoDuration === d ? "bg-accent border-accent text-white" : "bg-surface border-border text-text-secondary hover:bg-surface-hover"} ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}>
                <input type="radio" value={d} checked={videoDuration === d} onChange={() => setVideoDuration(d)} disabled={isGenerating} className="hidden" />
                <span className="text-xs">{d}秒</span>
              </label>
            ))}
          </div>
        </div>

        {/* 分辨率 */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-medium">分辨率:</span>
          <div className="flex gap-1">
            <label className={`px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-colors font-medium ${videoResolution === "720p" ? "bg-accent border-accent text-white" : "bg-surface border-border text-text-secondary hover:bg-surface-hover"} ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}>
              <input type="radio" value="720p" checked={videoResolution === "720p"} onChange={(e) => setVideoResolution(e.target.value)} disabled={isGenerating} className="hidden" />
              <span className="text-xs">720P</span>
            </label>
            <label className={`px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-colors font-medium ${videoResolution === "1080p" ? "bg-accent border-accent text-white" : "bg-surface border-border text-text-secondary hover:bg-surface-hover"} ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}>
              <input type="radio" value="1080p" checked={videoResolution === "1080p"} onChange={(e) => setVideoResolution(e.target.value)} disabled={isGenerating} className="hidden" />
              <span className="text-xs">1080P</span>
            </label>
          </div>
        </div>

        {/* 比例 */}
        <div className="flex items-center gap-2">
          <span className="text-text-secondary font-medium">比例:</span>
          <div className="flex gap-1">
            {["16:9", "9:16"].map(r => (
              <label key={r} className={`px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-colors font-medium ${videoAspectRatio === r ? "bg-accent border-accent text-white" : "bg-surface border-border text-text-secondary hover:bg-surface-hover"} ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}>
                <input type="radio" value={r} checked={videoAspectRatio === r} onChange={(e) => setVideoAspectRatio(e.target.value)} disabled={isGenerating} className="hidden" />
                <span className="text-xs">{r === "16:9" ? "横屏" : "竖屏"}</span>
              </label>
            ))}
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
          className="brut-btn bg-accent text-white px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
