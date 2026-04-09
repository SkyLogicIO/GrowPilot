"use client";

import { useState } from "react";
import { ChevronRight, Gauge, ShieldCheck, User, Users, Workflow, X } from "lucide-react";

export default function CreateTeamModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [teamSize, setTeamSize] = useState<"2-20" | "20+">("2-20");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center px-6" style={{ zIndex: 100000 }}>
      <div className="w-full max-w-5xl bg-surface rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/10 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative p-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-emerald-500/10" />
            <div className="relative">
              <div className="text-3xl font-bold text-white">开启团队协作</div>
              <div className="mt-3 text-sm text-gray-300">打造专属空间，提升创作效率</div>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-accent-bright" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">会员专属可商用模型</div>
                    <div className="mt-1 text-sm text-gray-400">海量可商用会员模型，为创作保驾护航</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Workflow size={18} className="text-purple-300" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">团队生态资产互通</div>
                    <div className="mt-1 text-sm text-gray-400">发布仅团队可见的工作流、模型、图片</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Gauge size={18} className="text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">专业版团队共享算力/加速次数</div>
                    <div className="mt-1 text-sm text-gray-400">支持团队共享算力与加速次数，统一管理</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <X size={18} className="text-gray-300" />
            </button>

            <div className="text-2xl font-bold text-white">创建团队</div>

            <div className="mt-8 flex items-center justify-between">
              <div className="w-[140px] h-[140px] rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <User size={28} className="text-white" />
                </div>
              </div>
              <ChevronRight size={26} className="text-white/20" />
              <div className="w-[140px] h-[140px] rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Users size={28} className="text-white" />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-sm text-gray-300">
                <span className="text-red-400">*</span> 预计使用人数
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTeamSize("2-20")}
                  className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                    teamSize === "2-20"
                      ? "bg-accent/20 border-blue-500 text-white"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  2–20人
                </button>
                <button
                  type="button"
                  onClick={() => setTeamSize("20+")}
                  className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                    teamSize === "20+"
                      ? "bg-accent/20 border-blue-500 text-white"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  20人以上
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full h-12 bg-accent hover:bg-accent-light text-white rounded-xl font-bold transition-all shadow-lg shadow-accent/30"
            >
              免费创建团队
            </button>
            <div className="mt-3 text-xs text-gray-500 text-center">团队可邀请多人加入，一人付费全员共享</div>
          </div>
        </div>
      </div>
    </div>
  );
}
