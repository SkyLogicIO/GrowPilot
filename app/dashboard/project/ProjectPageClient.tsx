"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeDollarSign, Copy, MoreHorizontal, Share2, Trash2, Video, X } from "lucide-react";
import { demoProjects, formatProjectTime } from "@/lib/demoProjects";
import NewProjectModal, { type ModeKey } from "@/components/NewProjectModal";
import ValueAddedServiceModal from "@/components/ValueAddedServiceModal";
import ProjectDetailPanel from "./ProjectDetailPanel";

type Attachment = {
  type: "image" | "video";
  src: string;
  name: string;
};

type ProjectDetails = {
  id: number;
  name: string;
  statusText?: string;
  updatedAt: string;
  cover: string;
  mode: "视频生成" | "图像生成" | "数字人" | "AI营销助手" | "AI换脸";
  model: string;
  ratio: string;
  count: string;
  advanced: string;
  prompt: string;
  resultTitle: string;
  resultHint: string;
  attachments: Attachment[];
};

export default function ProjectPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openDetailIds, setOpenDetailIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | number>("list");
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [localProjects, setLocalProjects] = useState<any[]>([]);
  const [createRequest, setCreateRequest] = useState<{ mode: ModeKey; signal: number } | null>(null);
  const [valueAddedOpen, setValueAddedOpen] = useState(false);

  const visibleProjects = useMemo(() => {
    const all = [...localProjects, ...demoProjects];
    return all.filter((p) => !deletedIds.includes(p.id));
  }, [deletedIds, localProjects]);

  const activeId = typeof activeTab === "number" ? activeTab : null;
  const activeProject = useMemo(
    () => (activeId ? visibleProjects.find((p) => p.id === activeId) ?? null : null),
    [activeId, visibleProjects]
  );

  const projectNameById = useMemo(() => new Map(visibleProjects.map((p) => [p.id, p.name])), [visibleProjects]);

  useEffect(() => {
    const rawMode = searchParams.get("create");
    const mode = rawMode === "video" || rawMode === "image" || rawMode === "avatar" ? rawMode : null;
    if (!mode) return;
    setCreateRequest({ mode, signal: Date.now() });
    router.replace("/dashboard/project");
  }, [router, searchParams]);

  const openDetail = (id: number) => {
    setOpenDetailIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveTab(id);
  };

  const closeDetail = (id: number) => {
    setOpenDetailIds((prev) => {
      const next = prev.filter((x) => x !== id);
      if (activeTab === id) {
        setActiveTab(next.length ? next[next.length - 1] : "list");
      }
      return next;
    });
  };

  const deleteProject = (id: number) => {
    setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    closeDetail(id);
  };

  const copyText = async (text: string) => {
    try {
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
    } catch {
      return;
    }
  };

  const details = useMemo<ProjectDetails | null>(() => {
    if (!activeProject) return null;

    const category = activeProject.name.includes("房产") ? "房产" : activeProject.name.includes("教育") ? "教育" : "餐饮";
    const attachmentPool: Record<"房产" | "教育" | "餐饮", string[]> = {
      房产: [
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
      ],
      教育: [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
      ],
      餐饮: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
      ],
    };

    const pool = attachmentPool[category];
    const nextCover = pool[(activeProject.id + 1) % pool.length];
    const thirdCover = pool[(activeProject.id + 2) % pool.length];
    const attachments: Attachment[] = [
      { type: "image", src: activeProject.cover, name: "主视觉" },
      { type: "image", src: nextCover, name: "参考素材" },
      { type: "image", src: thirdCover, name: "参考素材" },
      { type: "video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", name: "参考视频" },
    ];

    const base = {
      id: activeProject.id,
      name: activeProject.name,
      statusText: activeProject.statusText,
      updatedAt: activeProject.updatedAt,
      cover: activeProject.cover,
      attachments,
    };

    if (activeProject.id === 1) {
      return {
        ...base,
        mode: "视频生成" as const,
        model: "Seedream 4.5",
        ratio: "3:4",
        count: "4",
        advanced: "默认",
        prompt: "为一家本地餐厅制作 15 秒短视频：主打新品套餐，节奏快，强调限时优惠与到店自提。",
        resultTitle: "视频预览",
        resultHint: "此处为示例预览，后续可接入真实生成任务。",
      };
    }

    if (activeProject.id === 2) {
      return {
        ...base,
        mode: "图像生成" as const,
        model: "Seedream 4.5",
        ratio: "3:4",
        count: "4",
        advanced: "默认",
        prompt: "生成一组广告风格海报：清爽亮色背景，品牌主色蓝紫渐变，突出产品卖点与 CTA。",
        resultTitle: "图片结果",
        resultHint: "点击图片可查看大图。",
      };
    }

    if (activeProject.id === 3) {
      return {
        ...base,
        mode: "数字人" as const,
        model: "Seedream 4.5",
        ratio: "9:16",
        count: "1",
        advanced: "默认",
        prompt: "创建一个亲和力强的数字人口播：介绍新品套餐，语速中等，强调限时优惠并引导到店。",
        resultTitle: "数字人预览",
        resultHint: "此处为示例预览，后续可接入真实生成任务。",
      };
    }

    let mode: ProjectDetails["mode"] = "AI营销助手";
    let prompt = "请作为 AI营销助手，帮我规划一周短视频选题：餐饮门店，目标同城获客，给出 7 条选题与对应脚本结构。";
    let resultTitle = "任务结果";

    if (activeProject.mode) {
      if (activeProject.mode === "faceswap") {
        mode = "AI换脸";
        prompt = activeProject.prompt || "AI换脸任务";
        resultTitle = "换脸结果";
      } else if (activeProject.mode === "image") {
        mode = "图像生成";
        prompt = activeProject.prompt || "";
        resultTitle = "图片结果";
      } else if (activeProject.mode === "video") {
        mode = "视频生成";
        prompt = activeProject.prompt || "";
        resultTitle = "视频结果";
      } else if (activeProject.mode === "avatar") {
        mode = "数字人";
        prompt = activeProject.prompt || "";
        resultTitle = "数字人预览";
      }
    }

    return {
      ...base,
      mode,
      model: "Seedream 4.5",
      ratio: "-",
      count: "-",
      advanced: "默认",
      prompt,
      resultTitle,
      resultHint: "此处为示例输出，后续可接入真实生成任务。",
    };
  }, [activeProject]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("list");
                    router.replace("/dashboard/project");
                  }}
                  className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors ${
                    activeTab === "list" ? "text-white bg-white/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  我的项目（{visibleProjects.length}）
                </button>

                {openDetailIds.map((id) => (
                  <div
                    key={id}
                    className={`h-10 rounded-xl transition-colors ${activeTab === id ? "bg-white/10" : "hover:bg-white/5"}`}
                  >
                    <div className="h-full flex items-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`h-full pl-4 pr-2 rounded-l-xl text-sm font-bold transition-colors max-w-[260px] truncate ${
                          activeTab === id ? "text-white" : "text-gray-300 hover:text-white"
                        }`}
                      >
                        {projectNameById.get(id) ?? `方案${String(id).padStart(2, "0")}`}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          closeDetail(id);
                        }}
                        className={`h-full pr-3 pl-2 rounded-r-xl transition-colors ${
                          activeTab === id ? "text-gray-200 hover:text-white" : "text-gray-400 hover:text-white"
                        }`}
                        aria-label={`关闭 ${projectNameById.get(id) ?? `方案${String(id).padStart(2, "0")}`} 详情页`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValueAddedOpen(true)}
                  className="h-11 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold transition-colors flex items-center gap-2"
                >
                  <BadgeDollarSign size={18} className="text-blue-200" />
                  联系专属客服
                </button>

                <NewProjectModal
                  defaultMode={createRequest?.mode}
                  openSignal={createRequest?.signal}
                  onProjectCreated={(project) => {
                    setLocalProjects((prev) => [project, ...prev]);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ValueAddedServiceModal
        open={valueAddedOpen}
        onClose={() => setValueAddedOpen(false)}
        defaultProjectName={activeProject?.name}
      />

      {activeProject && details ? (
        <ProjectDetailPanel
          details={details}
          onClose={() => {
            closeDetail(details.id);
            router.replace("/dashboard/project");
          }}
        />
      ) : (
        <div className="bg-[#0F1115] border border-white/5 rounded-2xl p-6">
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleProjects.map((project) => (
                <div key={project.id} onClick={() => openDetail(project.id)} className="text-left cursor-pointer group">
                  <div className="relative aspect-video rounded-xl border border-white/5 overflow-hidden bg-white/5">
                    <img src={project.cover} alt={project.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />

                    <div className="absolute right-3 top-3 z-10 flex items-center justify-end gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md transition-colors flex items-center justify-center"
                        aria-label="删除"
                      >
                        <Trash2 size={18} className="text-white" />
                      </button>
                      <div className="relative group/share">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyText(`${window.location.origin}/dashboard/project?demo=${project.id}`);
                          }}
                          className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md transition-colors flex items-center justify-center"
                          aria-label="分享"
                        >
                          <Share2 size={18} className="text-white" />
                        </button>
                        <div className="pointer-events-none absolute right-0 -top-2 -translate-y-full opacity-0 translate-y-1 group-hover/share:opacity-100 group-hover/share:translate-y-0 transition-all">
                          <div className="w-[360px] rounded-xl border border-white/10 bg-[#0F1115] ring-1 ring-white/10 px-3 py-2 text-xs text-white shadow-2xl whitespace-pre-wrap break-words">
                            分享后其他用户可以看到并使用参数模版来复制同款，每一次使用您将获得额外的积分激励。
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openDetail(project.id);
                        }}
                        className="w-10 h-10 rounded-xl bg-black/35 border border-white/10 hover:bg-black/45 backdrop-blur-md transition-colors flex items-center justify-center"
                        aria-label="更多"
                      >
                        <MoreHorizontal size={18} className="text-white" />
                      </button>
                    </div>

                    {project.statusText && (
                      <div className="pointer-events-none absolute left-3 top-14 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                        <div className="max-w-[260px] rounded-xl border border-white/10 bg-[#0F1115] ring-1 ring-white/10 px-3 py-2 text-xs text-white shadow-2xl">
                          <div className="font-semibold">{project.statusText}</div>
                          <div className="mt-1 text-white/80">提示：点击下方“立即加速”</div>
                        </div>
                      </div>
                    )}

                    {project.statusText && (
                      <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all">
                        <div className="relative group/boost">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="px-5 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center"
                            >
                              立即加速
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                copyText(`${project.name}${project.statusText ? `\n${project.statusText}` : ""}`);
                              }}
                              className="px-5 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                              <Copy size={16} className="text-white" />
                              一键复制
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="px-5 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                              <Video size={16} className="text-white" />
                              图生视频
                            </button>
                          </div>
                          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-12 opacity-0 translate-y-1 group-hover/boost:opacity-100 group-hover/boost:translate-y-0 transition-all">
                            <div className="whitespace-nowrap px-3 py-2 rounded-xl border border-white/10 bg-[#0F1115] ring-1 ring-white/10 text-xs text-white shadow-2xl">
                              消耗5Coins 提速55分钟！
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">
                      {project.statusText ?? project.name}
                    </div>
                    <div className="text-xs text-gray-500">{formatProjectTime(project.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
