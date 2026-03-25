"use client";

import { GoogleGenAI } from "@google/genai";
import { useMemo, useState, type ReactNode } from "react";
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
  type LucideIcon,
} from "lucide-react";

// const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
const GEMINI_MODEL = "gemini-2.5-flash";

type ToolKey = "chat" | "copy" | "script" | "ecom" | "ad";

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
        className={`max-w-[820px] rounded-2xl border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? "bg-white/5 border-white/10 text-gray-100"
            : "bg-blue-600/20 border-blue-500/20 text-white"
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

  const recommendedTools = useMemo(
    () => RECOMMENDED_SETS[recommendIndex % RECOMMENDED_SETS.length],
    [recommendIndex]
  );

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => t.title.toLowerCase().includes(q));
  }, [query, threads]);

  const placeholder = useMemo(() => {
    if (activeTool === "chat") return "发送消息输入 / 提问（例如：如何提升直播间留存率？）";
    if (activeTool === "copy") return "发送消息输入 / 选择技能（例如：新品饮品的 3 条种草文案）";
    if (activeTool === "script") return "发送消息输入 / 选择技能（例如：15 秒口播脚本，三段式结构）";
    if (activeTool === "ecom") return "发送消息输入 / 选择技能（例如：提炼卖点、SKU 对比、详情页结构）";
    return "发送消息输入 / 选择技能（例如：投放素材 10 条标题与 5 条主视觉文案）";
  }, [activeTool]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;

    const apiKey = window.localStorage.getItem("gemini_api_key")?.trim();
    setDraft("");
    const now = Date.now();
    const aiMsgId = `a_${now}`;

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { id: `u_${now}`, role: "user", content: text },
        {
          id: aiMsgId,
          role: "assistant",
          content: "请先在右上角头像 -> [我的资料] 中设置 Gemini API Key。",
        },
      ]);
      return;
    }

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
      const ai = new GoogleGenAI({ apiKey });

      const history = messages
        .filter((m) => m.id !== "m1" && m.id !== "m2")
        .slice(-50)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const chat = ai.chats.create({
        model: GEMINI_MODEL,
        config: {
          systemInstruction: "你是一个专业的AI营销助手，擅长内容创作与流量增长。",
          maxOutputTokens: 8192,
        },
        history,
      });

      const stream = await chat.sendMessageStream({ message: text });
      let fullText = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text ?? "";
        fullText += chunkText;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: fullText } : m))
        );
      }
    } catch (error: unknown) {
      console.error("Gemini API Error:", error);
      let errMsg = error instanceof Error ? error.message : "未知错误";
      if (errMsg.includes("404") || errMsg.includes("not found")) {
        errMsg += " (请检查：1. API Key 是否有多余空格；2. 代理节点是否为美国/新加坡，Gemini 不支持香港/CN 节点)";
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, content: `请求失败: ${errMsg}` } : m
        )
      );
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0F1115] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[720px]">
        <div className="border-r border-white/5 bg-[#0B0D10]">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <Bot size={18} className="text-blue-200" />
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
              className="mt-5 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              新对话
            </button>

            <div className="mt-4 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center px-3 gap-2">
              <Search size={16} className="text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
                      active
                        ? "bg-white/10 border-white/10 text-white"
                        : "bg-transparent border-transparent text-gray-300 hover:bg-white/5"
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
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex flex-col gap-4">
                <div>
                  <div className="text-lg font-bold text-white">AI营销助手</div>
                  <div className="mt-1 text-sm text-gray-400">一站式对话式创作：文案、脚本、电商、投放素材</div>
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
                        className={`h-10 px-4 rounded-full border transition-colors flex items-center gap-2 ${
                          active
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <Icon size={16} className={active ? "text-blue-200" : "text-gray-400"} />
                        <span className="text-sm font-bold">{t.label}</span>
                      </button>
                    );
                  })}

                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 ml-2">
                    <Sparkles size={14} className="text-blue-300" />
                    <span>支持多模态与结构化输出</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[360px] rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                    <Sparkles size={16} className="text-blue-200" />
                    推荐工具
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecommendIndex((v) => v + 1)}
                    className="h-8 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <RefreshCcw size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-200">换一换</span>
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {recommendedTools.map((title) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => setDraft((prev) => (prev.trim() ? prev : `${title}：`))}
                      className="h-9 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-semibold text-gray-200"
                    >
                      {title}
                    </button>
                  ))}
                </div>
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
            <div className="rounded-2xl border border-white/10 bg-[#0F1115] overflow-hidden">
              <div className="px-4 py-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={placeholder}
                  className="w-full min-h-[64px] max-h-[500px] resize-y bg-transparent outline-none text-sm text-gray-100 placeholder:text-gray-600"
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
                </div>

                <button
                  type="button"
                  onClick={send}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center gap-2"
                >
                  <Send size={16} className="text-white" />
                  发送 ({draft.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
