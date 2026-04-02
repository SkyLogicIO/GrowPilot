"use client";

import { useMemo, useState, useRef, type ReactNode } from "react";
import {
  Bot,
  Clapperboard,
  FileText,
  Megaphone,
  RefreshCcw,
  Send,
  ShoppingBag,
  Sparkles,
  Image,
  ChevronDown,
  Plus,
  Search,
  Loader2,
  type LucideIcon,
} from "lucide-react";

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const TOOL_PRESETS: { key: string; label: string; icon: LucideIcon }[] = [
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

const INITIAL_THREADS = [
  { id: "t1", title: "智能体使用示例-亚马逊" },
  { id: "t2", title: "智能体使用示例-淘宝" },
  { id: "t3", title: "未命名" },
  { id: "t4", title: "未命名" },
];

const INITIAL_MESSAGES: { id: string; role: "user" | "assistant"; content: string }[] = [
  {
    id: "m1",
    role: "assistant",
    content: "我可以作为 AI电商智能体，帮你把常用的电商运营任务变成可复用的模板。你可以在上方选择一个类型开始。",
  },
  {
    id: "m2",
    role: "assistant",
    content: "你也可以直接选择右侧推荐工具：我会按你当前目标，给出结构化产出（标题/脚本/卖点/话术等）。",
  },
];

// ─── 聊天气泡 ───────────────────────────────────────────────────────────────────

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

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function EcomAgentPageClient() {
  const [activeThreadId, setActiveThreadId] = useState("t1");
  const [activeTool, setActiveTool] = useState("chat");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
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
    return q ? INITIAL_THREADS.filter((t) => t.title.toLowerCase().includes(q)) : INITIAL_THREADS;
  }, [query]);

  const send = async () => {
    const text = draft.trim();
    if (!text || isSendingRef.current) return;

    setDraft("");
    const now = Date.now();
    const aiMsgId = `a_${now}`;
    isSendingRef.current = true;

    setMessages((prev) => [
      ...prev,
      { id: `u_${now}`, role: "user" as const, content: text },
      { id: aiMsgId, role: "assistant" as const, content: "思考中..." },
    ]);

    // TODO: 对接后端 API
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: `[${activeTool}] 功能开发中，即将对接后端 API。` }
            : m,
        ),
      );
      isSendingRef.current = false;
    }, 1500);
  };

  return (
    <div className="brut-card-static overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[720px]">
        {/* ── 左侧边栏 ── */}
        <div className="border-r-2 border-border bg-surface-hover">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]">
                <Bot size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-text-primary truncate">
                  电商智能体
                </div>
                <div className="text-xs text-text-muted truncate">
                  内容创作 · 流量增长
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveThreadId(`t_${Date.now()}`)}
              className="mt-5 w-full h-10 rounded-xl bg-surface border-2 border-border text-sm font-bold text-text-primary hover:bg-surface-hover transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A]"
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
                    <div className="text-sm truncate">{t.title}</div>
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
                    电商智能体
                  </div>
                  <div className="mt-1 text-sm text-text-secondary">
                    一站式对话式创作：文案、脚本、电商、投放素材
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {TOOL_PRESETS.map(({ key, label, icon: Icon }) => {
                    const active = key === activeTool;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTool(key)}
                        className={`h-10 px-4 rounded-xl border-2 transition-colors flex items-center gap-2 font-bold ${
                          active
                            ? "bg-accent border-border text-white shadow-[2px_2px_0px_#1A1A1A]"
                            : "bg-surface border-border text-text-secondary hover:bg-surface-hover"
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{label}</span>
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
                      onClick={() => setDraft((prev) => (prev.trim() ? prev : `${title}：`))}
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
            <div className="rounded-xl border-2 border-border bg-surface-hover overflow-hidden shadow-[3px_3px_0px_#1A1A1A]">
              <div className="px-4 pt-4">
                {/* 上行：图片图标 + 输入框 */}
                <div className="flex items-start gap-3 mb-3">
                  <button
                    type="button"
                    className="shrink-0 w-11 h-11 rounded-xl bg-surface border-2 border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
                  >
                    <Image size={20} className="text-text-secondary" />
                  </button>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="询问您的问题"
                    disabled={isSendingRef.current}
                    rows={2}
                    className="flex-1 bg-transparent resize-none outline-none text-sm text-text-primary placeholder:text-text-muted leading-relaxed pt-1 disabled:opacity-50"
                  />
                </div>

                {/* 下行：选择器 + 操作区 */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-surface border-2 border-border text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      <Bot size={12} />
                      <span>电商智能体</span>
                      <ChevronDown size={11} className="text-text-muted" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-surface border-2 border-border text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      <span className="font-black text-accent text-xs">a</span>
                      <span>亚马逊</span>
                      <ChevronDown size={11} className="text-text-muted" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-surface border-2 border-border text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      <span className="text-sm">🇬🇧</span>
                      <span>英文</span>
                      <ChevronDown size={11} className="text-text-muted" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 h-8 rounded-lg bg-surface border-2 border-border text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      模板库 <span className="text-text-muted">&rsaquo;</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 h-8 rounded-lg bg-surface border-2 border-border text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      自定义模板
                      <RefreshCcw size={11} className="text-text-muted ml-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={send}
                      disabled={isSendingRef.current || !draft.trim()}
                      className="w-9 h-9 rounded-xl bg-purple border-2 border-border flex items-center justify-center transition-all hover:bg-purple/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A]"
                    >
                      {isSendingRef.current ? (
                        <Loader2 size={15} className="text-white animate-spin" />
                      ) : (
                        <Send size={15} className="text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
