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
  chatWithGemini,
  generateVideo,
  generateImage,
  type MediaItem,
} from "@/lib/ai";
import {
  getSystemPrompt,
  getPlaceholder,
  type ToolKey,
} from "@/lib/prompts/marketing-prompts";
import {
  loadThreads,
  saveThread,
  deleteThread,
  generateThreadId,
  type EcomChatThread,
  type EcomChatMessage,
  type StorageToolKey,
} from "@/lib/storage/ecom-chat";
import { useMediaStore } from "@/hooks/useMediaStore";
import { saveProject, generateProjectId } from "@/lib/storage/index";
import { useWorkspaceState } from "@/components/workspace/useWorkspaceState";
import type { WorkspaceAsset, CurrentBrief } from "@/components/workspace/types";

// ─── Hook 参数类型 ──────────────────────────────────────────────────

export type SessionToolKey = "ecom" | "selling-point";

interface ChatSessionOptions {
  toolKey: SessionToolKey;
  chatModeOptions?: { value: string; label: string }[];
}

// ─── 筛选配置 ─────────────────────────────────────────────────────────

export const PLATFORM_OPTIONS = [
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

export const INTENT_OPTIONS = [
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

export const LANGUAGE_OPTIONS = [
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

const DEFAULT_CHAT_MODE_OPTIONS = [
  { value: "电商智能体", label: "电商智能体" },
  { value: "图像生成", label: "图像生成" },
  { value: "图像编辑", label: "图像编辑" },
];

// ─── 常量 ─────────────────────────────────────────────────────────────

const WELCOME_MESSAGES: Record<SessionToolKey, string> = {
  ecom: "你好，我是电商智能体。直接输入你的需求即可开始，支持文案创作、卖点分析、图片生成等。",
  "selling-point": "你好，我是卖点图设计助手。选择一个模板开始，或直接描述你的产品与需求。",
};

// ─── ChatSidebarProps 类型（供 ChatSidebar 组件使用） ──────────────────

export interface ChatSidebarProps {
  threads: EcomChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  messages: EcomChatMessage[];
  currentMedia: MediaItem[];
  selectedAssetId: string | null;
  onAssetClick: (assetId: string) => void;
  draft: string;
  onDraftChange: (v: string) => void;
  isSending: boolean;
  onSend: () => void;
  placeholder: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  filterPlatform: string;
  onFilterPlatformChange: (v: string) => void;
  filterIntent: string;
  onFilterIntentChange: (v: string) => void;
  filterLang: string;
  onFilterLangChange: (v: string) => void;
  chatMode: string;
  onChatModeChange: (v: string) => void;
  chatModeOptions: { value: string; label: string }[];
  inputAreaTopSlot?: ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

// ─── Hook ─────────────────────────────────────────────────────────────

export function useEcomChatSession(options: ChatSessionOptions) {
  const { toolKey } = options;
  const chatModeOptions = options.chatModeOptions ?? DEFAULT_CHAT_MODE_OPTIONS;

  // ── 状态 ──
  const [threads, setThreads] = useState<EcomChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("Amazon");
  const [filterIntent, setFilterIntent] = useState("写产品文案");
  const [filterLang, setFilterLang] = useState("中文");
  const [chatMode, setChatMode] = useState(chatModeOptions[0]?.value ?? "电商智能体");

  const mediaStore = useMediaStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── 派生状态 ──
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId],
  );
  const messages = useMemo(
    () => activeThread?.messages ?? [],
    [activeThread],
  );
  const placeholder = useMemo(() => getPlaceholder(toolKey as ToolKey), [toolKey]);
  const currentMedia = useMemo(
    () => mediaStore.getMedia(activeThreadId),
    [mediaStore, activeThreadId],
  );

  // ── 工作区状态 ──
  const workspace = useWorkspaceState({
    activeThreadId,
    threadTitle: activeThread?.title ?? "新对话",
    chatMode,
    filterPlatform,
    filterIntent,
    filterLang,
    mediaItems: currentMedia,
    messages,
  });

  // ── 初始化 ──
  useEffect(() => {
    const loaded = loadThreads(toolKey as StorageToolKey);
    if (loaded.length === 0) {
      const id = generateThreadId();
      const thread: EcomChatThread = {
        id,
        title: "新对话",
        messages: [{
          id: "welcome",
          role: "assistant",
          content: WELCOME_MESSAGES[toolKey],
          timestamp: Date.now(),
        }],
        activeTool: toolKey as ToolKey,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      saveThread(thread, toolKey as StorageToolKey);
      setThreads([thread]);
      setActiveThreadId(id);
    } else {
      setThreads(loaded);
      setActiveThreadId(loaded[0].id);
    }
  }, [toolKey]);

  // ── 自动滚动 ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 线程操作 ──

  const handleNewThread = useCallback(() => {
    const id = generateThreadId();
    const thread: EcomChatThread = {
      id,
      title: "新对话",
      messages: [{
        id: "welcome",
        role: "assistant",
        content: WELCOME_MESSAGES[toolKey],
        timestamp: Date.now(),
      }],
      activeTool: toolKey as ToolKey,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveThread(thread, toolKey as StorageToolKey);
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(id);
  }, [toolKey]);

  const handleDeleteThread = useCallback(
    (id: string) => {
      deleteThread(id, toolKey as StorageToolKey);
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
    [activeThreadId, handleNewThread, mediaStore, toolKey],
  );

  // ── 发送消息 ──

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || isSending) return;

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

      const history = [
        ...(activeThread?.messages ?? [])
          .filter((m) => m.id !== "welcome" && m.content !== "分析中..." && !m.content.startsWith("请求失败:"))
          .slice(-50)
          .map((m) => ({
            role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
            content: m.content,
          })),
        {
          role: "user" as const,
          content: fullText,
          imageDataUrl: workspace.selectedAsset?.type === "image"
            && workspace.selectedAsset?.status === "ready"
            && workspace.selectedAsset?.dataUrl
            ? workspace.selectedAsset.dataUrl
            : undefined,
        },
      ];

      const reply = await chatWithGemini({
        messages: history,
        systemInstruction: getSystemPrompt(toolKey as ToolKey),
        maxOutputTokens: 8192,
      });
      finalText = reply;

      if (!finalText.trim()) {
        finalText = "AI 未返回有效回复，请重试。";
      }

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

      const mediaIds: string[] = [];

      if (imageDescriptions.length > 0) {
        const descs = imageDescriptions.slice(0, 2);
        const imgs: MediaItem[] = [];

        for (let i = 0; i < descs.length; i++) {
          const placeholderId = `media_${now}_img_${i}`;
          mediaStore.addMedia(activeThreadId, [{
            id: placeholderId,
            type: "image",
            dataUrl: "",
            prompt: descs[i],
            createdAt: Date.now(),
            status: "生成中...",
          }]);
          mediaIds.push(placeholderId);
        }

        const genPromises = descs.map(async (desc, i) => {
          const placeholderId = `media_${now}_img_${i}`;
          try {
            const result = await generateImage({
              prompt: desc,
              aspectRatio: "1:1",
            });
            mediaStore.updateVideo(activeThreadId, placeholderId, {
              dataUrl: result.imageUrl,
              status: undefined,
            });
            return {
              id: placeholderId,
              type: "image" as const,
              dataUrl: result.imageUrl,
              prompt: desc,
              createdAt: Date.now(),
            };
          } catch (err) {
            console.warn(`图片生成失败 (${desc}):`, err);
            mediaStore.updateVideo(activeThreadId, placeholderId, {
              status: "生成失败",
            });
            return null;
          }
        });

        const results = await Promise.all(genPromises);
        const succeeded = results.filter((r): r is NonNullable<typeof r> => r !== null);
        if (succeeded.length > 0) {
          imgs.push(...succeeded);
          workspace.setSelectedAssetId(succeeded[succeeded.length - 1].id);
        }
      }

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

        updateAiMessage(finalText, mediaIds);

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
        updateAiMessage(finalText, mediaIds);
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
        if (current) saveThread(current, toolKey as StorageToolKey);
        return updated;
      });
    }
  }, [draft, isSending, activeThread, activeThreadId, mediaStore, filterPlatform, filterIntent, filterLang, chatMode, workspace.setSelectedAssetId, toolKey]);

  // ── 视频生成 ──

  const handleGenerateVideo = useCallback(
    async (scriptText: string, messageId: string) => {
      const videoId = `media_${Date.now()}_video`;

      mediaStore.addVideo(activeThreadId, {
        id: videoId,
        type: "video",
        dataUrl: "",
        prompt: scriptText,
        createdAt: Date.now(),
        status: "提交生成请求...",
      });

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
        const cleanPrompt = scriptText
          .replace(/\[IMAGE:\s*[^\]]+\]/g, "")
          .replace(/\[VIDEO:\s*[^\]]+\]/g, "")
          .trim();

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

        setChatMode("图像编辑");
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [currentMedia, mediaStore, activeThreadId],
  );

  // ── 工作区主动作 ──

  const handleSendToChat = useCallback(
    (asset: WorkspaceAsset) => {
      const typeLabel = asset.type === "video" ? "视频" : "图片";
      const context = `[基于${typeLabel}: ${asset.prompt.slice(0, 50)}] 请帮我 `;
      setDraft(context);
      setChatMode(chatModeOptions[0]?.value ?? "电商智能体");
      textareaRef.current?.focus();
    },
    [chatModeOptions],
  );

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddToProject = useCallback(
    (asset: WorkspaceAsset, brief: CurrentBrief) => {
      saveProject({
        id: generateProjectId(),
        name: brief.threadTitle || "电商创作",
        mode: asset.type === "video" ? "video" : "image",
        prompt: asset.prompt,
        resultUrl: asset.dataUrl,
        resultType: asset.type,
        createdAt: new Date().toISOString(),
        metadata: {
          sourceThreadId: brief.threadId,
          sourceMessageId: asset.sourceMessageId,
        },
      });
      setToastMsg("已加入项目");
      setTimeout(() => setToastMsg(null), 2000);
    },
    [],
  );

  const handleRemoveAsset = useCallback(
    (assetId: string) => {
      mediaStore.removeMedia(activeThreadId, assetId);
      workspace.handleAssetRemoved(assetId);
    },
    [activeThreadId, mediaStore, workspace],
  );

  // ── 组装返回值 ──

  const chatSidebarProps: ChatSidebarProps = {
    threads,
    activeThreadId,
    onSelectThread: setActiveThreadId,
    onNewThread: handleNewThread,
    onDeleteThread: handleDeleteThread,
    messages,
    currentMedia,
    selectedAssetId: workspace.selectedAssetId,
    onAssetClick: workspace.setSelectedAssetId,
    draft,
    onDraftChange: setDraft,
    isSending,
    onSend: send,
    placeholder,
    onFileUpload: handleFileChange,
    fileInputRef,
    textareaRef,
    filterPlatform,
    onFilterPlatformChange: setFilterPlatform,
    filterIntent,
    onFilterIntentChange: setFilterIntent,
    filterLang,
    onFilterLangChange: setFilterLang,
    chatMode,
    onChatModeChange: setChatMode,
    chatModeOptions,
    messagesEndRef,
  };

  return {
    chatSidebarProps,
    workspace,
    toastMsg,
    send,
    handleSendToChat,
    handleAddToProject,
    handleRemoveAsset,
    setDraft,
    mediaStore,
    activeThreadId,
  };
}
