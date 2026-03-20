"use client";

import { Info, Pause, Play, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CreateVoiceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateVoiceModal({ open, onClose }: CreateVoiceModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-[640px] bg-[#15171E] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="text-xl font-bold text-white">创建声音</div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 space-y-6">
          {/* Label */}
          <div className="flex items-center gap-2">
            <div className="text-white font-bold text-base flex items-center">
              <span className="text-red-500 mr-1">*</span>
              原始视频
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-1.5">
              <Info size={14} className="text-gray-500" />
              克隆原始视频中的声音为您创建自定义声音。
            </div>
          </div>

          {/* Video Player Area */}
          <div className="relative w-full aspect-[16/9] bg-[#0F1115] rounded-xl border border-white/10 flex flex-col items-center justify-center overflow-hidden">
            {/* Top Right Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/5">
                <Upload size={14} className="text-gray-300" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/5">
                <Trash2 size={14} className="text-gray-300" />
              </button>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col items-center gap-4 w-full max-w-[320px]">
               <div className="flex items-center gap-3 text-white font-bold text-lg">
                 <button 
                   onClick={() => setIsPlaying(!isPlaying)}
                   className="hover:opacity-80 transition-opacity"
                 >
                   {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                 </button>
                 <span className="tabular-nums text-base font-medium">00:30 / 00:45</span>
               </div>

               {/* Progress Bar */}
               <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                 <div className="h-full bg-white/30 w-2/3 rounded-full" />
               </div>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <div className="relative flex items-center pt-0.5">
              <input
                type="checkbox"
                id="legal-check"
                className="peer h-4 w-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 cursor-pointer"
              />
            </div>
            <label htmlFor="legal-check" className="text-xs text-gray-400 leading-relaxed cursor-pointer select-none">
              我在此确认我拥有上传和克隆这些声音样本的所有必要权利或同意，并且我不会将平台生成的内容用于任何非法、欺诈或有害的目的。
            </label>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-center pt-2">
            <button
              className="h-10 px-6 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 text-sm font-bold transition-colors border border-white/5"
            >
              立即克隆
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
