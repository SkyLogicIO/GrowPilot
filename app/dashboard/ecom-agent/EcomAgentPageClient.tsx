"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  Send,
  Plus,
  ChevronDown,
  Loader2,
  Trash2,
  MessageSquare,
  Play,
  ImageIcon,
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
import { agentChatStream } from "@/lib/api/agents";
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
        className={`max-w-[260px] rounded-xl px-3 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-accent/15 border border-accent/20 text-text-primary"
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
        <div className="absolute top-full left-0 right-8 mt-1 z-50 bg-stone-900 border border-white/[0.08] rounded-xl shadow-xl shadow-black/40 overflow-hidden min-w-[220px] max-h-[240px] flex flex-col">
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
      {message.content}
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

  const mediaStore = useMediaStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    setDraft("");
    setIsSending(true);

    const now = Date.now();
    const userMsg: EcomChatMessage = {
      id: `u_${now}`,
      role: "user",
      content: text,
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

      // ── 调用后端营销助手 Agent（流式） ──
      try {
        const stream = agentChatStream("marketing-assistant", {
          product_info: text,
        });

        for await (const event of stream) {
          if (event.type === "complete" && event.result) {
            finalText = event.result;
          } else if (event.type === "step_complete" && event.result) {
            // 逐步展示中间结果
            setThreads((prev) => {
              const updated = prev.map((t) =>
                t.id === activeThreadId
                  ? {
                      ...t,
                      messages: t.messages.map((m) =>
                        m.id === `a_${now}`
                          ? { ...m, content: event.result || "分析中...", timestamp: Date.now() }
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
          } else if (event.type === "error") {
            throw new Error(event.error || "Agent 执行失败");
          }
        }
      } catch (agentError: unknown) {
        // Agent API 失败，fallback 到普通 Gemini 对话
        console.warn("Agent API failed, falling back to Gemini:", agentError);

        const history = [
          ...(activeThread?.messages ?? [])
            .filter((m) => m.id !== "welcome" && m.content !== "分析中..." && !m.content.startsWith("请求失败:"))
            .slice(-50)
            .map((m) => ({
              role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
              content: m.content,
            })),
          { role: "user" as const, content: text },
        ];

        const reply = await chatWithGemini({
          messages: history,
          systemInstruction: getSystemPrompt("ecom"),
          maxOutputTokens: 8192,
        });
        finalText = reply;
      }

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
              numberOfImages: 1,
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
  }, [draft, isSending, activeThread, activeThreadId, mediaStore]);

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

  // ── 渲染 ──

  return (
    <div className="h-[calc(100vh-140px)] flex rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
      {/* ── 左侧对话面板 ── */}
      <div className="w-full lg:w-[300px] lg:min-w-[300px] flex flex-col lg:border-r border-white/[0.06]">
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
            <div className="flex items-center justify-end px-2 pb-2">
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
