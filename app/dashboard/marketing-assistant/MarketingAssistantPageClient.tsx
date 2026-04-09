"use client";

import { useMemo, useState, useRef, type ReactNode } from "react";
import {
  Bot,
  Clapperboard,
  FileText,
  Megaphone,
  Paperclip,
  Plus,
  RefreshCcw,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { chat } from "@/lib/api/gemini";
import type { ChatMessage, ChatResponse } from "@/lib/api/gemini";
import {
  getSystemPrompt,
  getPlaceholder,
  type ToolKey,
} from "../../../lib/prompts/marketing-prompts";

const TOOL_PRESETS: { key: ToolKey; label: string; icon: LucideIcon }[] = [
  { key: "chat", label: "智能问答", icon: Bot },
  { key: "copy", label: "产生文案", icon: FileText },
  { key: "script", label: "拍摄脚本", icon: Clapperboard },
  { key: "ecom", label: "电商卖点", icon: ShoppingBag },
  { key: "ad", label: "创作素材", icon: Megaphone },
];

const RECOMMENDED_SETS = [
  ["直播话术生成", "带货脚本生成", "短视频拍摄脚本", "爆款脚本仿写"],
  ["小红书标题优化", "朋友圈种草文案", "评论区引导话术", "直播间开场白"],
  ["产品卖点提炼", "竞品对比表", "投放素材拆解", "落地页结构建议"],
  ["短视频选题库", "15 秒口播模板", "剧情反转脚本", "直播间复盘清单"],
  ["私域社群话术", "活动促销文案", "门店同城引流", "达人合作邀约"],
];

const buildInitialThreads = (): { id: string; title: string }[] => [
  { id: "t1", title: "同城门店：一周短视频选题" },
  { id: "t2", title: "直播带货：开场与逼单话术" },
  { id: "t3", title: "小红书：种草笔记标题优化" },
  { id: "t4", title: "投放：素材拆解与改写" },
];

const buildInitialMessages = (): {
  id: string;
  role: "user" | "assistant";
  content: string;
}[] => [
  {
    id: "m1",
    role: "assistant",
    content:
      "我可以作为 AI营销助手，帮你把常用的内容与增长任务变成可复用的模板。你可以在上方选择一个类型开始。",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "你也可以直接选择右侧推荐工具：我会按你当前目标，给出结构化产出（标题/脚本/卖点/话术等）。",
  },
];

function RoleBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: ReactNode;
}) {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[820px] rounded-2xl border-2 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? "bg-surface border-border text-text-primary"
            : "bg-accent/15 border-accent/40 text-text-primary"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function MarketingAssistantPageClient() {
  const threads = useMemo(() => buildInitialThreads(), []);
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id ?? "t1");
  const [activeTool, setActiveTool] = useState<ToolKey>("chat");
  const [messages, setMessages] = useState(() => buildInitialMessages());
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [recommendIndex, setRecommendIndex] = useState(0);
  const isSendingRef = useRef(false);

  const recommendedTools = useMemo(
    () => RECOMMENDED_SETS[recommendIndex % RECOMMENDED_SETS.length],
    [recommendIndex],
  );

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => t.title.toLowerCase().includes(q));
  }, [query, threads]);

  const placeholder = useMemo(() => getPlaceholder(activeTool), [activeTool]);

  const send = async () => {
    const text = draft.trim();
    if (!text || isSendingRef.current) return;

    setDraft("");
    const now = Date.now();
    const aiMsgId = `a_${now}`;
    isSendingRef.current = true;

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      { id: `u_${now}`, role: "user", content: text },
      {
        id: aiMsgId,
        role: "assistant",
        content: "思考中...",
      },
    ]);

    try {
      // 构建对话历史（排除初始欢迎消息，手动追加当前用户消息）
      const history: ChatMessage[] = [
        ...messages
          .filter((m) => m.id !== "m1" && m.id !== "m2")
          .slice(-50)
          .map((m) => ({
            role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
            content: m.content,
          })),
        { role: "user" as const, content: text },
      ];

      const response: ChatResponse = await chat({
        messages: history,
        system_instruction: getSystemPrompt(activeTool),
        max_tokens: 8192,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: response.content }
            : m,
        ),
      );
    } catch (error: unknown) {
      let errMsg =
        error instanceof Error ? error.message : "请求失败";
      if (errMsg.includes("401") || errMsg.includes("登录已过期")) {
        errMsg = "登录已过期，请重新登录";
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: `请求失败: ${errMsg}` }
            : m,
        ),
      );
    } finally {
      isSendingRef.current = false;
    }
  };

  return (
    <div className="brut-card-static overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[720px]">
        {/* ── 左侧边栏 ── */}
        <div className="border-r-2 border-border bg-surface-hover">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent border-2 border-border flex items-center justify-center shadow-md">
                <Bot size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-text-primary truncate">
                  AI营销助手
                </div>
                <div className="text-xs text-text-muted truncate">
                  内容创作 · 流量增长
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const now = Date.now();
                const id = `t_${now}`;
                setActiveThreadId(id);
              }}
              className="mt-5 w-full h-10 rounded-xl bg-surface border-2 border-border text-sm font-bold text-text-primary hover:bg-surface-hover transition-colors flex items-center justify-center gap-2 shadow-md active:translate-y-0.5 active:shadow-sm"
            >
              <Plus size={16} />
              新对话
            </button>

            <div className="mt-4 h-10 rounded-xl bg-surface border-2 border-border flex items-center px-3 gap-2">
              <Search size={16} className="text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索历史对话"
                className="w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="px-3 pb-4">
            <div className="px-2 text-xs font-bold text-text-muted uppercase tracking-wider">
              历史对话
            </div>
            <div className="mt-2 space-y-1">
              {filteredThreads.map((t) => {
                const active = t.id === activeThreadId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveThreadId(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-colors ${
                      active
                        ? "bg-accent/15 border-accent/40 text-text-primary font-bold"
                        : "bg-transparent border-transparent text-text-secondary hover:bg-surface hover:border-border"
                    }`}
                  >
                    <div className="text-sm truncate">
                      {t.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 右侧主区域 ── */}
        <div className="flex flex-col">
          {/* 顶部工具栏 */}
          <div className="px-6 py-5 border-b-2 border-border">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex flex-col gap-4">
                <div>
                  <div className="text-lg font-black text-text-primary">
                    AI营销助手
                  </div>
                  <div className="mt-1 text-sm text-text-secondary">
                    一站式对话式创作：文案、脚本、电商、投放素材
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {TOOL_PRESETS.map((t) => {
                    const active = t.key === activeTool;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTool(t.key)}
                        className={`h-10 px-4 rounded-xl border-2 transition-colors flex items-center gap-2 ${
                          active
                            ? "bg-accent border-border text-white shadow-md"
                            : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                        } font-bold`}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{t.label}</span>
                      </button>
                    );
                  })}

                  <div className="hidden md:flex items-center gap-2 text-xs text-text-muted ml-2">
                    <Sparkles size={14} className="text-accent" />
                    <span>支持多模态与结构化输出</span>
                  </div>
                </div>
              </div>

              {/* 推荐工具 */}
              <div className="w-full md:w-[360px] rounded-xl bg-surface-hover border-2 border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                    <Sparkles size={16} className="text-accent" />
                    推荐工具
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecommendIndex((v) => v + 1)}
                    className="h-8 px-3 rounded-lg bg-surface border-2 border-border hover:bg-surface-hover transition-colors flex items-center gap-2 font-bold text-text-secondary"
                  >
                    <RefreshCcw size={14} />
                    <span className="text-xs">换一换</span>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendedTools.map((title) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() =>
                        setDraft((prev) =>
                          prev.trim() ? prev : `${title}：`,
                        )
                      }
                      className="h-9 px-3 rounded-lg bg-surface border-2 border-border hover:bg-surface-hover transition-colors text-sm font-bold text-text-secondary"
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 px-6 py-5 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((m) => (
                <RoleBubble key={m.id} role={m.role}>
                  {m.content}
                </RoleBubble>
              ))}
            </div>
          </div>

          {/* 输入区域 */}
          <div className="px-6 py-4 border-t-2 border-border bg-surface">
            <div className="rounded-xl border-2 border-border bg-surface-hover overflow-hidden shadow-lg">
              <div className="px-4 py-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={placeholder}
                  disabled={isSendingRef.current}
                  className="w-full min-h-[64px] max-h-[500px] resize-y bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted disabled:opacity-50"
                />
              </div>
              <div className="px-4 pb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSendingRef.current}
                    className="w-10 h-10 rounded-xl bg-surface border-2 border-border hover:bg-surface-hover transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Paperclip size={18} className="text-text-secondary" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={send}
                  disabled={isSendingRef.current || !draft.trim()}
                  className="h-10 px-5 rounded-xl brut-btn-primary font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingRef.current ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
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
