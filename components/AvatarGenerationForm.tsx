"use client";

import { useRef, useState } from "react";
import { Plus, Loader2, Zap, SlidersHorizontal } from "lucide-react";

export interface AvatarGenerationParams {
  prompt: string;
  name: string;
  inputImage?: File | null;
}

export interface AvatarGenerationResult {
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

interface AvatarGenerationFormProps {
  isGenerating: boolean;
  onGenerate: (params: AvatarGenerationParams) => Promise<AvatarGenerationResult>;
}

export default function AvatarGenerationForm({ isGenerating, onGenerate }: AvatarGenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImagePreview, setInputImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInputImage(file);
    setInputImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    onGenerate({
      prompt,
      name: "",
      inputImage,
    });
  };

  const resetForm = () => {
    setPrompt("");
    setInputImage(null);
    setInputImagePreview("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
        <div
          onClick={() => !isGenerating && fileInputRef.current?.click()}
          className={`h-[180px] rounded-2xl border-2 border-dashed ${
            inputImagePreview ? "border-blue-500/50" : "border-white/10"
          } bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center ${
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
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={20} className="text-gray-200" />
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-200">添加参考图</div>
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

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请输入数字人形象、口播风格、场景与需要输出的内容…"
          disabled={isGenerating}
          className="h-[180px] w-full resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={isGenerating}
          className="w-10 h-10 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center disabled:opacity-50"
        >
          <SlidersHorizontal size={18} className="text-gray-400" />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isGenerating || !prompt.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Zap size={18} className="fill-white" />
              生成
            </>
          )}
        </button>
      </div>
    </div>
  );
}
