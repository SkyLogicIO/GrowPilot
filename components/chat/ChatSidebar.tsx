"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Plus,
  ChevronDown,
  Loader2,
  Trash2,
  MessageSquare,
  ImageIcon,
  Globe,
  ShoppingBag,
  Target,
  Paperclip,
  Bot,
} from "lucide-react";
import type { EcomChatThread, EcomChatMessage } from "@/lib/storage/ecom-chat";
import type { MediaItem } from "@/lib/ai";
import type { ChatSidebarProps } from "@/hooks/useEcomChatSession";

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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} relative`}>
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
  currentMedia,
  selectedAssetId,
  onAssetClick,
}: {
  message: EcomChatMessage;
  isLatest: boolean;
  currentMedia: MediaItem[];
  selectedAssetId: string | null;
  onAssetClick: (assetId: string) => void;
}) {
  const imageCount = (message.mediaRefs ?? []).filter((id) =>
    currentMedia.some((m) => m.id === id && m.type === "image"),
  ).length;

  const hasMediaRefs = (message.mediaRefs?.length ?? 0) > 0;
  const isSelected = hasMediaRefs && selectedAssetId
    ? message.mediaRefs!.includes(selectedAssetId)
    : false;
  const isClickable = hasMediaRefs;

  const displayContent = message.content
    .replace(/\[IMAGE:\s*[^\]]+\]/g, "")
    .replace(/\[VIDEO:\s*[^\]]+\]/g, "")
    .trim();

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
          {displayContent}
        </Markdown>
      ) : (
        message.content
      )}
      {imageCount > 0 && (
        <div
          className={isClickable ? "cursor-pointer" : ""}
          onClick={() => {
            if (isClickable && message.mediaRefs?.[0]) {
              onAssetClick(message.mediaRefs[0]);
            }
          }}
        >
          <MediaRefTag count={imageCount} />
        </div>
      )}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-accent" />
      )}
    </ChatBubble>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────

export default function ChatSidebar(props: ChatSidebarProps) {
  const {
    threads,
    activeThreadId,
    onSelectThread,
    onNewThread,
    onDeleteThread,
    messages,
    currentMedia,
    selectedAssetId,
    onAssetClick,
    draft,
    onDraftChange,
    isSending,
    onSend,
    placeholder,
    onFileUpload,
    fileInputRef,
    textareaRef,
    filterPlatform,
    onFilterPlatformChange,
    filterIntent,
    onFilterIntentChange,
    filterLang,
    onFilterLangChange,
    chatMode,
    onChatModeChange,
    chatModeOptions,
    inputAreaTopSlot,
    messagesEndRef,
  } = props;

  return (
    <div className="w-full lg:w-[350px] lg:min-w-[350px] flex flex-col lg:border-r border-white/[0.06]">
      {/* 线程选择器 */}
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <ThreadSelector
          threads={threads}
          activeId={activeThreadId}
          onSelect={onSelectThread}
          onNew={onNewThread}
          onDelete={onDeleteThread}
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
              selectedAssetId={selectedAssetId}
              onAssetClick={onAssetClick}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        {/* 插槽（如模板预览卡片） */}
        {inputAreaTopSlot}

        {/* 筛选按钮和对话模式选择 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <FilterSelect
            icon={<Bot size={12} />}
            options={chatModeOptions}
            value={chatMode}
            onChange={onChatModeChange}
            activeColor="bg-blue-500/15 text-blue-400"
          />
          <FilterSelect
            icon={<ShoppingBag size={12} />}
            options={[
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
            ]}
            value={filterPlatform}
            onChange={onFilterPlatformChange}
            activeColor="bg-accent/15 text-accent"
          />
          <FilterSelect
            icon={<Target size={12} />}
            options={[
              { value: "写产品文案", label: "产品文案" },
              { value: "写卖点分析", label: "卖点分析" },
              { value: "写拍摄脚本", label: "拍摄脚本" },
              { value: "写短视频脚本", label: "短视频脚本" },
              { value: "写直播话术", label: "直播话术" },
              { value: "做产品图设计", label: "产品图设计" },
              { value: "写标题优化", label: "标题优化" },
              { value: "写SEO描述", label: "SEO描述" },
              { value: "写竞品分析", label: "竞品分析" },
            ]}
            value={filterIntent}
            onChange={onFilterIntentChange}
            activeColor="bg-violet-500/15 text-violet-400"
          />
          <FilterSelect
            icon={<Globe size={12} />}
            options={[
              { value: "中文", label: "中文" },
              { value: "英文", label: "English" },
              { value: "日文", label: "日本語" },
              { value: "韩文", label: "한국어" },
              { value: "德文", label: "Deutsch" },
              { value: "法文", label: "Français" },
              { value: "西班牙文", label: "Español" },
              { value: "葡萄牙文", label: "Português" },
              { value: "阿拉伯文", label: "العربية" },
            ]}
            value={filterLang}
            onChange={onFilterLangChange}
            activeColor="bg-emerald-500/15 text-emerald-400"
          />
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
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
                onChange={onFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <button
              type="button"
              onClick={onSend}
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
  );
}
