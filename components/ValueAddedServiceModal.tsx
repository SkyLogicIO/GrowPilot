"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeDollarSign, ClipboardCheck, X } from "lucide-react";

type ValueAddedServiceModalProps = {
  open: boolean;
  onClose: () => void;
  defaultProjectName?: string;
};

export default function ValueAddedServiceModal({ open, onClose, defaultProjectName }: ValueAddedServiceModalProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [contact, setContact] = useState("");
  const [projectName, setProjectName] = useState("");
  const [goal, setGoal] = useState("");
  const [requirement, setRequirement] = useState("");
  const [assets, setAssets] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    return {
      contact: contact.trim(),
      projectName: projectName.trim(),
      goal: goal.trim(),
      requirement: requirement.trim(),
      assets: assets.trim(),
      createdAt: new Date().toISOString(),
    };
  }, [assets, contact, goal, projectName, requirement]);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setError(null);
    setSubmitting(false);
    setProjectName(defaultProjectName ?? "");
  }, [defaultProjectName, open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (el.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onClose();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  const submit = async () => {
    setError(null);
    const trimmedContact = contact.trim();
    const trimmedRequirement = requirement.trim();
    if (!trimmedContact) {
      setError("请填写联系方式（手机号/微信/邮箱）。");
      return;
    }
    if (!trimmedRequirement) {
      setError("请填写需求说明，方便技术与运营评估与报价。");
      return;
    }

    setSubmitting(true);
    try {
      const text = [
        "【GrowPilot 专属客服咨询】",
        `联系方式：${payload.contact}`,
        payload.projectName ? `需求标题：${payload.projectName}` : "需求标题：-",
        payload.goal ? `创作类型：${payload.goal}` : "创作类型：-",
        `详细说明：${payload.requirement}`,
        payload.assets ? `素材/文件/链接：${payload.assets}` : "素材/文件/链接：-",
        `提交时间：${payload.createdAt}`,
      ].join("\n");
      await copyToClipboard(text);
      setSubmitted(true);
    } catch {
      setError("提交失败：无法复制到剪贴板，请检查浏览器权限。");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center px-6" style={{ zIndex: 100000 }}>
      <div ref={rootRef} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-surface shadow-2xl ring-1 ring-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <BadgeDollarSign size={18} className="text-accent-bright" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">联系专属客服</div>
              <div className="mt-0.5 text-xs text-gray-500">您的专属客服收到消息后会尽快和您取得联系</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            <X size={18} className="text-gray-200" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {submitted ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ClipboardCheck size={18} className="text-emerald-200" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white">已提交（已复制到剪贴板）</div>
                  <div className="mt-1 text-xs text-gray-400">可将内容粘贴给专属客服，或用于后续接入后端提交。</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setError(null);
                  }}
                  className="h-11 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold transition-colors"
                >
                  继续填写
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold transition-colors shadow-lg shadow-accent/30"
                >
                  关闭
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-white">联系方式</div>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="必填：手机号/微信/邮箱（任选其一）"
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent-light transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-white">需求标题</div>
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="可选：例如“房产项目 15 秒短视频”"
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent-light transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">创作类型</div>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="可选：例如“短视频脚本 / 海报设计 / 投放素材 / 代运营咨询”"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent-light transition-colors"
                />
                <div className="text-xs text-gray-500">建议写清楚：渠道（抖音/小红书/朋友圈）、数量、时长/尺寸、交付格式。</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">详细说明</div>
                <textarea
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="必填：请描述你的需求（行业/产品、目标人群、预算范围、期望风格、时间节点等）"
                  className="w-full h-28 resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent-light transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">素材 / 链接</div>
                <textarea
                  value={assets}
                  onChange={(e) => setAssets(e.target.value)}
                  placeholder="可选：粘贴素材链接、参考视频/图片、品牌规范、竞品链接等（多行输入）"
                  className="w-full h-24 resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent-light transition-colors"
                />
              </div>

              {error ? <div className="text-sm text-red-300">{error}</div> : null}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="h-11 px-5 rounded-xl bg-accent hover:bg-accent-light disabled:opacity-60 disabled:hover:bg-accent text-white font-bold transition-colors shadow-lg shadow-accent/30"
                >
                  {submitting ? "提交中..." : "提交"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
