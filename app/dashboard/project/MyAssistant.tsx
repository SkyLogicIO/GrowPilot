"use client";

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Bot,
  FileText,
  Clapperboard,
  ShoppingBag,
  Megaphone,
  Sparkles,
  Plus,
  Search,
  Paperclip,
  Send,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

type ToolKey = "copy" | "script" | "ecom" | "ad";

type MessageRole = "assistant" | "user";

interface ToolPreset {
  key: ToolKey;
  label: string;
  icon: LucideIcon;
}

interface Thread {
  id: string;
  title: string;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

const TOOL_PRESETS: ToolPreset[] = [
  { key: "copy", label: "产生文案", icon: FileText },
  { key: "script", label: "拍摄脚本", icon: Clapperboard },
  { key: "ecom", label: "电商卖点", icon: ShoppingBag },
  { key: "ad", label: "投放素材", icon: Megaphone },
];

const buildInitialThreads = (): Thread[] => [
  { id: "t1", title: "AIGC 平台图文视频与文本对话混合设计" },
  { id: "t2", title: "地域文化民族风情小报" },
  { id: "t3", title: "UI/UX 主要调整内容" },
  { id: "t4", title: "周报及缺陷报告" },
];

const buildInitialMessages = (): ChatMessage[] => [
  {
    id: "m1",
    role: "assistant",
    content: "我可以作为 AI营销助手，帮你把常用的电商/媒体创作任务变成可复用的模板。你可以在上方选择一个类型开始。",
  },
  {
    id: "m2",
    role: "assistant",
    content: "\n二、内容呈现方式\n\n1. 图像展示优化\n- 生成的图像以卡片形式嵌入对话流，支持点击放大\n- 右键菜单提供编辑、保存、生成视频等操作\n- 悬停显示生成参数（提示词、模型、步数）\n\n2. 视频集成方案\n- 缩略图预览：生成视频后自动创建预览缩略图，支持播放/暂停\n- 时间轴交互：提供简化时间轴，允许用户选择帧进行编辑\n- 画中画：支持在保持对话的同时，小窗播放视频\n\n四、实用交互细节\n- 多模态输入支持\n- 快捷技能选择与工作流复用",
  },
];

interface RoleBubbleProps {
  role: MessageRole;
  children: ReactNode;
}

function RoleBubble({ role, children }: RoleBubbleProps) {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[820px] rounded-2xl border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? "bg-white/5 border-white/10 text-gray-100"
            : "bg-accent/20 border-accent-light/30 text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function MyAssistant() {
  const threads = useMemo(() => buildInitialThreads(), []);
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id ?? "t1");
  const [activeTool, setActiveTool] = useState<ToolKey>("copy");
  const [messages, setMessages] = useState<ChatMessage[]>(() => buildInitialMessages());
  const [draft, setDraft] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => t.title.toLowerCase().includes(q));
  }, [query, threads]);

  const placeholder = useMemo(() => {
    if (activeTool === "copy") return "发送消息输入 / 选择技能（例如：新品饮品的 3 条种草文案）";
    if (activeTool === "script") return "发送消息输入 / 选择技能（例如：15 秒口播脚本，三段式结构）";
    if (activeTool === "ecom") return "发送消息输入 / 选择技能（例如：提炼卖点、SKU 对比、详情页结构）";
    return "发送消息输入 / 选择技能（例如：投放素材 10 条标题与 5 条主视觉文案）";
  }, [activeTool]);

  const send = (): void => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `u_${now}`, role: "user", content: text },
      {
        id: `a_${now}`,
        role: "assistant",
        content: "已收到。我会按你选择的类型给出结构化输出（示例数据），后续可接入真实模型生成。",
      },
    ]);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[720px]">
        <div className="border-r border-white/5 bg-[#0B0D10]">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <Bot size={18} className="text-accent-bright" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">AI营销助手</div>
                <div className="text-xs text-gray-500 truncate">内容创作 · 流量增长</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const now = Date.now();
                const id = `t_${now}`;
                setActiveThreadId(id);
              }}
              className="mt-5 w-full h-10 rounded-xl bg-accent hover:bg-accent-light text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              新对话
            </button>

            <div className="mt-4 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center px-3 gap-2">
              <Search size={16} className="text-gray-500" />
              <input
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                placeholder="搜索历史对话"
                className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="px-3 pb-4">
            <div className="px-2 text-xs font-semibold text-gray-500">历史对话</div>
            <div className="mt-2 space-y-1">
              {filteredThreads.map((t) => {
                const active = t.id === activeThreadId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveThreadId(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                      active ? "bg-white/10 border-white/10 text-white" : "bg-transparent border-transparent text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <div className="text-sm font-semibold truncate">{t.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="px-6 py-5 border-b border-white/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-bold text-white">AI营销助手</div>
                <div className="mt-1 text-sm text-gray-400">一站式对话式创作：文案、脚本、电商、投放素材</div>
              </div>

              <button
                type="button"
                className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal size={16} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-200">偏好</span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {TOOL_PRESETS.map((t) => {
                const active = t.key === activeTool;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTool(t.key)}
                    className={`h-10 px-4 rounded-full border transition-colors flex items-center gap-2 ${
                      active ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-accent-bright" : "text-gray-400"} />
                    <span className="text-sm font-bold">{t.label}</span>
                  </button>
                );
              })}

              <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-gray-500">
                <Sparkles size={14} className="text-accent-bright" />
                <span>支持多模态与结构化输出</span>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-5 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((m) => (
                <RoleBubble key={m.id} role={m.role}>
                  {m.content}
                </RoleBubble>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/5 bg-[#0B0D10]">
            <div className="rounded-2xl border border-white/10 bg-surface overflow-hidden">
              <div className="px-4 py-3">
                <textarea
                  value={draft}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
                  placeholder={placeholder}
                  className="w-full h-16 resize-none bg-transparent outline-none text-sm text-gray-100 placeholder:text-gray-600"
                />
              </div>
              <div className="px-4 pb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    <Paperclip size={18} className="text-gray-300" />
                  </button>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-accent-bright" />
                    <span className="text-sm font-semibold text-gray-200">深度思考</span>
                  </button>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <Bot size={16} className="text-gray-300" />
                    <span className="text-sm font-semibold text-gray-200">技能</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={send}
                  className="h-10 px-5 rounded-xl bg-accent hover:bg-accent-light text-white font-bold transition-colors flex items-center gap-2"
                >
                  <Send size={16} className="text-white" />
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
