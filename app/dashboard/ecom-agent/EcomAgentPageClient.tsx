"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Plus,
  ChevronDown,
  Loader2,
  Trash2,
  MessageSquare,
  Play,
  ImageIcon,
  Globe,
  ShoppingBag,
  Target,
  Paperclip,
  Bot,
} from "lucide-react";
import {
  chatWithGemini,
  generateVideo,
  generateImage,
  type MediaItem,
} from "@/lib/ai";
import {
  getSystemPrompt,
  getPlaceholder,
} from "@/lib/prompts/marketing-prompts";
import {
  loadThreads,
  saveThread,
  deleteThread,
  generateThreadId,
  type EcomChatThread,
  type EcomChatMessage,
} from "@/lib/storage/ecom-chat";
import { useMediaStore } from "@/hooks/useMediaStore";
import MediaGallery from "./MediaGallery";

// ─── 筛选配置 ─────────────────────────────────────────────────────────

const PLATFORM_OPTIONS = [
  { value: "Amazon", label: "亚马逊" },
  { value: "Taobao", label: "淘宝" },
  { value: "Tmall", label: "天猫" },
  { value: "TikTok Shop", label: "TikTok" },
  { value: "TEMU", label: "Temu" },
  { value: "Shopify", label: "Shopify" },
  { value: "Shopee", label: "虾皮" },
  { value: "Lazada", label: "Lazada" },
  { value: "JD.com", label: "京东" },
  { value: "Pinduoduo", label: "拼多多" },
];

const INTENT_OPTIONS = [
  { value: "写产品文案", label: "产品文案" },
  { value: "写卖点分析", label: "卖点分析" },
  { value: "写拍摄脚本", label: "拍摄脚本" },
  { value: "写短视频脚本", label: "短视频脚本" },
  { value: "写直播话术", label: "直播话术" },
  { value: "做产品图设计", label: "产品图设计" },
  { value: "写标题优化", label: "标题优化" },
  { value: "写SEO描述", label: "SEO描述" },
  { value: "写竞品分析", label: "竞品分析" },
];

const LANGUAGE_OPTIONS = [
  { value: "中文", label: "中文" },
  { value: "英文", label: "English" },
  { value: "日文", label: "日本語" },
  { value: "韩文", label: "한국어" },
  { value: "德文", label: "Deutsch" },
  { value: "法文", label: "Français" },
  { value: "西班牙文", label: "Español" },
  { value: "葡萄牙文", label: "Português" },
  { value: "阿拉伯文", label: "العربية" },
];

const CHAT_MODE_OPTIONS = [
  { value: "电商智能体", label: "电商智能体" },
  { value: "图像生成", label: "图像生成" },
  { value: "图像编辑", label: "图像编辑" },
];

// ─── FilterSelect 子组件 ─────────────────────────────────────────────

function FilterSelect({
  icon,
  options,
  value,
  onChange,
  activeColor,
}: {
  icon: ReactNode;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  activeColor: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, [open]);

  const isActive = !!value;

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-1 px-2 h-7 rounded-lg border text-[11px] font-bold transition-colors truncate ${
          isActive
            ? `${activeColor} border-current/40`
            : "bg-white/[0.04] border-white/[0.08] text-text-muted hover:bg-white/[0.07]"
        }`}
      >
        <span className="shrink-0 opacity-70">{icon}</span>
        <span className="truncate flex-1 text-left ml-0.5">{selected?.label ?? options[0].label}</span>
        <ChevronDown size={10} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-36 bg-slate-900 border border-white/[0.1] rounded-xl shadow-xl shadow-black/40 overflow-hidden py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                opt.value === value
                  ? "bg-accent/15 text-accent font-bold"
                  : "text-text-secondary hover:bg-white/[0.04] font-medium"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 常量 ─────────────────────────────────────────────────────────────

const WELCOME_MSG: EcomChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "你好，我是电商智能体。直接输入你的需求即可开始，支持文案创作、卖点分析、图片生成等。",
  timestamp: 0,
};

// ─── 子组件 ───────────────────────────────────────────────────────────

function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[260px] rounded-xl px-3 py-2.5 text-[13px] leading-relaxed break-words ${
          isUser
            ? "whitespace-pre-wrap bg-accent/15 border border-accent/20 text-text-primary"
            : "bg-white/[0.03] border border-white/[0.06] text-text-primary"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function MediaRefTag({ count }: { count: number }) {
  return (
    <div className="mt-1.5 pt-1.5 border-t border-white/[0.06]">
      <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-md bg-accent/8">
        <ImageIcon size={11} className="text-accent shrink-0" />
        <span className="text-[11px] text-accent font-bold">
          已在工作区生成 {count} 项素材
        </span>
      </div>
    </div>
  );
}

function GenerateVideoButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-1.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold hover:bg-accent/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Play size={11} className="fill-current" />
      生成视频
    </button>
  );
}

function ThreadSelector({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  threads: EcomChatThread[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: PointerEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, [isOpen]);

  const activeThread = threads.find((t) => t.id === activeId);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex-1 min-w-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
        >
          <MessageSquare size={14} className="text-text-muted shrink-0" />
          <span className="text-xs font-bold text-text-secondary truncate">
            {activeThread?.title || "选择对话"}
          </span>
          <ChevronDown
            size={12}
            className={`text-text-muted shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={onNew}
          className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-colors shrink-0"
          title="新对话"
        >
          <Plus size={14} className="text-text-muted" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-8 mt-1 z-50 bg-slate-900 border border-white/[0.08] rounded-xl shadow-xl shadow-black/40 overflow-hidden min-w-[220px] max-h-[240px] flex flex-col">
          <div className="flex-1 overflow-y-auto py-1">
            {threads.length === 0 && (
              <div className="px-3 py-3 text-xs text-text-muted text-center">
                暂无对话
              </div>
            )}
            {threads.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors group ${
                  t.id === activeId ? "bg-accent/10" : "hover:bg-white/[0.04]"
                }`}
                onClick={() => {
                  onSelect(t.id);
                  setIsOpen(false);
                }}
              >
                <span className="text-xs text-text-secondary truncate flex-1">
                  {t.title}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/[0.08] transition-all shrink-0"
                >
                  <Trash2 size={12} className="text-text-muted" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 消息渲染器 ───────────────────────────────────────────────────────

function MessageRenderer({
  message,
  isLatest,
  currentMedia,
  onGenerateVideo,
}: {
  message: EcomChatMessage;
  isLatest: boolean;
  currentMedia: MediaItem[];
  onGenerateVideo: (scriptText: string, messageId: string) => void;
}) {
  const hasVideoRef = (message.mediaRefs ?? []).some((id) =>
    currentMedia.some((m) => m.id === id && m.type === "video"),
  );

  // 仅最新一条助手消息显示视频按钮（且未关联视频、非欢迎语）
  const showVideoBtn =
    isLatest &&
    message.role === "assistant" &&
    !hasVideoRef &&
    message.id !== "welcome";

  const imageCount = (message.mediaRefs ?? []).filter((id) =>
    currentMedia.some((m) => m.id === id && m.type === "image"),
  ).length;

  return (
    <ChatBubble role={message.role}>
      {message.role === "assistant" ? (
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
            h3: ({ children }) => <h3 className="text-[13px] font-bold mb-0.5">{children}</h3>,
            strong: ({ children }) => <strong className="font-bold text-text-primary">{children}</strong>,
            code: ({ className, children }) =>
              className ? (
                <code className="block rounded-lg bg-black/30 border border-white/[0.06] px-2.5 py-1.5 my-1.5 text-xs overflow-x-auto">{children}</code>
              ) : (
                <code className="bg-white/[0.06] px-1 py-0.5 rounded text-xs">{children}</code>
              ),
            table: ({ children }) => (
              <table className="w-full text-xs border-collapse border border-white/[0.08] my-1.5">{children}</table>
            ),
            th: ({ children }) => (
              <th className="bg-white/[0.04] border border-white/[0.08] px-2 py-1 text-left font-bold">{children}</th>
            ),
            td: ({ children }) => (
              <td className="border border-white/[0.08] px-2 py-1">{children}</td>
            ),
          }}
        >
          {message.content}
        </Markdown>
      ) : (
        message.content
      )}
      {imageCount > 0 && <MediaRefTag count={imageCount} />}
      {showVideoBtn && (
        <GenerateVideoButton
          onClick={() => onGenerateVideo(message.content, message.id)}
        />
      )}
    </ChatBubble>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────

export default function EcomAgentPageClient() {
  const [threads, setThreads] = useState<EcomChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("Amazon");
  const [filterIntent, setFilterIntent] = useState("写产品文案");
  const [filterLang, setFilterLang] = useState("中文");
  const [chatMode, setChatMode] = useState("电商智能体");

  const mediaStore = useMediaStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 派生状态
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId],
  );
  const messages = useMemo(
    () => activeThread?.messages ?? [],
    [activeThread],
  );
  const placeholder = useMemo(() => getPlaceholder("ecom"), []);
  const currentMedia = useMemo(
    () => mediaStore.getMedia(activeThreadId),
    [mediaStore, activeThreadId],
  );

  // 初始化
  useEffect(() => {
    const loaded = loadThreads();
    if (loaded.length === 0) {
      const id = generateThreadId();
      const thread: EcomChatThread = {
        id,
        title: "新对话",
        messages: [{ ...WELCOME_MSG, timestamp: Date.now() }],
        activeTool: "ecom",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      saveThread(thread);
      setThreads([thread]);
      setActiveThreadId(id);
    } else {
      setThreads(loaded);
      setActiveThreadId(loaded[0].id);
    }
  }, []);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 线程操作 ──

  const handleNewThread = useCallback(() => {
    const id = generateThreadId();
    const thread: EcomChatThread = {
      id,
      title: "新对话",
      messages: [{ ...WELCOME_MSG, timestamp: Date.now() }],
      activeTool: "ecom",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveThread(thread);
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(id);
  }, []);

  const handleDeleteThread = useCallback(
    (id: string) => {
      deleteThread(id);
      mediaStore.clearThread(id);
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (id === activeThreadId && next.length > 0) {
          setActiveThreadId(next[0].id);
        } else if (next.length === 0) {
          handleNewThread();
        }
        return next;
      });
    },
    [activeThreadId, handleNewThread, mediaStore],
  );

  // ── 发送消息（Agent API + 图片/视频生成） ──

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    // 拼入筛选上下文前缀
    const contextParts: string[] = [];
    if (chatMode !== "电商智能体") contextParts.push(`模式：${chatMode}`);
    if (filterPlatform) contextParts.push(`平台：${filterPlatform}`);
    if (filterIntent) contextParts.push(`任务：${filterIntent}`);
    if (filterLang) contextParts.push(`输出语言：${filterLang}`);
    const fullText = contextParts.length > 0
      ? `[${contextParts.join(" | ")}]\n${text}`
      : text;

    setDraft("");
    setIsSending(true);

    const now = Date.now();
    const userMsg: EcomChatMessage = {
      id: `u_${now}`,
      role: "user",
      content: fullText,
      timestamp: now,
    };
    const aiMsg: EcomChatMessage = {
      id: `a_${now}`,
      role: "assistant",
      content: "分析中...",
      timestamp: now,
    };

    const isFirstUserMsg =
      activeThread &&
      activeThread.messages.filter((m) => m.role === "user").length === 0;
    const newTitle = isFirstUserMsg
      ? text.slice(0, 30)
      : activeThread?.title ?? "新对话";

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              title: newTitle,
              messages: [...t.messages, userMsg, aiMsg],
              updatedAt: now,
            }
          : t,
      ),
    );

    try {
      let finalText = "";
      const imageDescriptions: string[] = [];
      const videoDescriptions: string[] = [];

      // ── 通过 GenAI 代理调用 Gemini ──
      const history = [
        ...(activeThread?.messages ?? [])
          .filter((m) => m.id !== "welcome" && m.content !== "分析中..." && !m.content.startsWith("请求失败:"))
          .slice(-50)
          .map((m) => ({
            role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
            content: m.content,
          })),
        { role: "user" as const, content: fullText },
      ];

      const reply = await chatWithGemini({
        messages: history,
        systemInstruction: getSystemPrompt("ecom"),
        maxOutputTokens: 8192,
      });
      finalText = reply;

      // ── 解析 [IMAGE:...] 和 [VIDEO:...] 标签 ──
      const imageRegex = /\[IMAGE:\s*([^\]]+)\]/g;
      const videoRegex = /\[VIDEO:\s*([^\]]+)\]/g;
      let imgMatch: RegExpExecArray | null;
      let vidMatch: RegExpExecArray | null;

      while ((imgMatch = imageRegex.exec(finalText)) !== null) {
        imageDescriptions.push(imgMatch[1].trim());
      }
      while ((vidMatch = videoRegex.exec(finalText)) !== null) {
        videoDescriptions.push(vidMatch[1].trim());
      }

      // 清除标签，构建展示文本
      let cleanText = finalText
        .replace(imageRegex, "")
        .replace(videoRegex, "")
        .trim();

      const mediaIds: string[] = [];

      // ── 生成图片 ──
      if (imageDescriptions.length > 0) {
        const descs = imageDescriptions.slice(0, 2);
        const imgs: MediaItem[] = [];

        for (let i = 0; i < descs.length; i++) {
          try {
            const result = await generateImage({
              prompt: descs[i],
              aspectRatio: "1:1",
            });
            const item: MediaItem = {
              id: `media_${now}_img_${i}`,
              type: "image",
              dataUrl: result.imageUrl,
              prompt: descs[i],
              createdAt: Date.now(),
            };
            imgs.push(item);
            mediaIds.push(item.id);
          } catch (err) {
            console.warn(`图片生成失败 (${descs[i]}):`, err);
          }
        }

        if (imgs.length > 0) {
          mediaStore.addMedia(activeThreadId, imgs);
          cleanText += `\n\n[已在工作区生成 ${imgs.length} 张图片]`;
        }
      }

      // ── 生成视频（异步，不阻塞文本回复） ──
      if (videoDescriptions.length > 0) {
        const videoDesc = videoDescriptions[0];
        const videoId = `media_${now}_video`;

        mediaStore.addVideo(activeThreadId, {
          id: videoId,
          type: "video",
          dataUrl: "",
          prompt: videoDesc,
          createdAt: now,
          status: "提交生成请求...",
        });
        mediaIds.push(videoId);
        cleanText += `\n\n[视频生成中，请稍候...]`;

        // 更新消息文本
        updateAiMessage(cleanText, mediaIds);

        // 异步生成视频（fire-and-forget）
        (async () => {
          try {
            const videoResult = await generateVideo({
              prompt: videoDesc,
              duration: 8,
              aspectRatio: "16:9",
              resolution: "720p",
              onProgress: (status) => {
                mediaStore.updateVideo(activeThreadId, videoId, { status });
              },
            });
            mediaStore.updateVideo(activeThreadId, videoId, {
              dataUrl: videoResult.videoUrl,
              status: "已完成",
            });
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "生成失败";
            mediaStore.updateVideo(activeThreadId, videoId, {
              status: `失败: ${msg}`,
            });
          }
        })();
      } else {
        updateAiMessage(cleanText, mediaIds);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "请求失败";
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === `a_${now}` ? { ...m, content: `请求失败: ${errMsg}` } : m,
                ),
              }
            : t,
        ),
      );
    } finally {
      setIsSending(false);
    }

    // 更新助手消息内容的辅助函数
    function updateAiMessage(content: string, mediaIds: string[]) {
      setThreads((prev) => {
        const updated = prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === `a_${now}`
                    ? { ...m, content, mediaRefs: mediaIds.length > 0 ? mediaIds : undefined, timestamp: Date.now() }
                    : m,
                ),
                updatedAt: Date.now(),
              }
            : t,
        );
        const current = updated.find((t) => t.id === activeThreadId);
        if (current) saveThread(current);
        return updated;
      });
    }
  }, [draft, isSending, activeThread, activeThreadId, mediaStore, filterPlatform, filterIntent, filterLang, chatMode]);

  // ── 视频生成 ──

  const handleGenerateVideo = useCallback(
    async (scriptText: string, messageId: string) => {
      const videoId = `media_${Date.now()}_video`;

      // 添加占位
      mediaStore.addVideo(activeThreadId, {
        id: videoId,
        type: "video",
        dataUrl: "",
        prompt: scriptText,
        createdAt: Date.now(),
        status: "提交生成请求...",
      });

      // 消息关联视频
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === messageId
                    ? { ...m, mediaRefs: [...(m.mediaRefs ?? []), videoId] }
                    : m,
                ),
              }
            : t,
        ),
      );

      try {
        // 清理 prompt：移除末尾的素材引用标记
        const cleanPrompt = scriptText.replace(/\n*\[已在工作区.*?\]\s*/g, "").trim();

        const videoResult = await generateVideo({
          prompt: cleanPrompt,
          duration: 8,
          aspectRatio: "16:9",
          resolution: "720p",
          onProgress: (status) => {
            mediaStore.updateVideo(activeThreadId, videoId, { status });
          },
        });

        mediaStore.updateVideo(activeThreadId, videoId, {
          dataUrl: videoResult.videoUrl,
          status: "已完成",
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "生成失败";
        mediaStore.updateVideo(activeThreadId, videoId, {
          status: `失败: ${msg}`,
        });
      }
    },
    [activeThreadId, mediaStore],
  );

  // ── 文件上传 ──

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        alert("目前仅支持上传图片文件！");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (!dataUrl) return;

        const newItem: MediaItem = {
          id: `media_${Date.now()}_upload`,
          type: "image",
          dataUrl,
          prompt: file.name,
          createdAt: Date.now(),
          status: "已上传",
        };

        const existingImages = currentMedia.filter((m) => m.type === "image");
        if (existingImages.length > 0) {
          if (window.confirm("检测到已有图片，是否使用新上传的图片替换它们？")) {
            existingImages.forEach((m) => mediaStore.removeMedia(activeThreadId, m.id));
            mediaStore.addMedia(activeThreadId, [newItem]);
          } else {
            mediaStore.addMedia(activeThreadId, [newItem]);
          }
        } else {
          mediaStore.addMedia(activeThreadId, [newItem]);
        }
        
        // 当上传图片时自动切换为“图像编辑”模式
        setChatMode("图像编辑");
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [currentMedia, mediaStore, activeThreadId],
  );

  // ── 渲染 ──

  return (
    <div className="h-[calc(100vh-140px)] flex rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
      {/* ── 左侧对话面板 ── */}
      <div className="w-full lg:w-[350px] lg:min-w-[350px] flex flex-col lg:border-r border-white/[0.06]">
        {/* 线程选择器 */}
        <div className="px-3 py-2 border-b border-white/[0.06]">
          <ThreadSelector
            threads={threads}
            activeId={activeThreadId}
            onSelect={setActiveThreadId}
            onNew={handleNewThread}
            onDelete={handleDeleteThread}
          />
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-2.5">
            {messages.map((m, idx) => (
              <MessageRenderer
                key={m.id}
                message={m}
                isLatest={idx === messages.length - 1}
                currentMedia={currentMedia}
                onGenerateVideo={handleGenerateVideo}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          {/* 筛选按钮和对话模式选择 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <FilterSelect
              icon={<Bot size={12} />}
              options={CHAT_MODE_OPTIONS}
              value={chatMode}
              onChange={setChatMode}
              activeColor="bg-blue-500/15 text-blue-400"
            />
            <FilterSelect
              icon={<ShoppingBag size={12} />}
              options={PLATFORM_OPTIONS}
              value={filterPlatform}
              onChange={setFilterPlatform}
              activeColor="bg-accent/15 text-accent"
            />
            <FilterSelect
              icon={<Target size={12} />}
              options={INTENT_OPTIONS}
              value={filterIntent}
              onChange={setFilterIntent}
              activeColor="bg-violet-500/15 text-violet-400"
            />
            <FilterSelect
              icon={<Globe size={12} />}
              options={LANGUAGE_OPTIONS}
              value={filterLang}
              onChange={setFilterLang}
              activeColor="bg-emerald-500/15 text-emerald-400"
            />
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={placeholder}
              disabled={isSending}
              rows={2}
              className="w-full bg-transparent resize-none outline-none text-[13px] text-text-primary placeholder:text-text-muted px-3 pt-2.5 pb-1 disabled:opacity-50"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors disabled:opacity-40"
                  title="上传附件"
                >
                  <Paperclip size={16} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <button
                type="button"
                onClick={send}
                disabled={isSending || !draft.trim()}
                className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 text-accent flex items-center justify-center transition-all hover:bg-accent/25 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 右侧工作区 ── */}
      <div className="hidden lg:flex flex-1 flex-col min-w-0">
        <MediaGallery
          items={currentMedia}
          onRemove={(mediaId) => mediaStore.removeMedia(activeThreadId, mediaId)}
        />
      </div>
    </div>
  );
}
