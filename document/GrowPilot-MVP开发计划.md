# GrowPilot MVP 开发计划

> 最后更新：2026-03-30
>
> 目标：短平快交付 AI 视觉营销工具 MVP，面向电商/设计客户"秀肌肉"
>
> 参考文档：`外包版前端业务板块与V2差异对比.md`

---

## 一、项目定位

面向电商商家、品牌设计团队、营销策划人员的 **AI 视觉营销工具集**。
MVP 阶段聚焦 **AI 能力展示**，让客户直观看到：生图、生视频、智能编辑、模特换装、局部重绘、营销文案六大核心能力。

---

## 二、技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.2 | 全栈框架，含 API Routes |
| React | 19 | UI 库 |
| Tailwind CSS | 4 | 样式（Soft Brutalism 主题） |
| TypeScript | 5+ | 全项目统一语言 |
| pnpm | — | 包管理器 |

### AI 服务（双引擎）

| 引擎 | 负责领域 | 具体模型 |
|------|---------|---------|
| **Google GenAI** | 生成类（从无到有） | Imagen 4.0（文生图）、Gemini 2.5 Flash Image（图编辑）、Veo 3.1（生视频）、Gemini 2.5 Flash（对话文案） |
| **ComfyUI** | 编辑类（精细操作） | RMBG/SAM（抠图）、Inpainting（局部重绘）、Virtual Try-On（换装）、Real-ESRGAN（高清放大）、ReActor（换脸） |

### 双引擎分工原则

- **Google GenAI 独占**：文生图、文生视频/图生视频、对话式文案 — ComfyUI 做不了或做不好
- **ComfyUI 独占**：专业抠图、服装换装、mask 局部重绘、高清放大、换脸 — Google GenAI 做不了
- **两者都能做**：换背景、风格转换、元素擦除 — 先用 Gemini 上线，后续 ComfyUI 补强精度

### 架构模式

```
┌── Next.js 前端 ──────────────────────────────────┐
│                                                  │
│  "生成类"功能                    "编辑类"功能        │
│   ↓                             ↓                │
│  /api/proxy/text2img    ──→ Google GenAI         │
│  /api/proxy/text2video  ──→ Google GenAI         │
│  (客户端直调 Gemini SDK) ──→ Google GenAI         │
│                                                  │
│  /api/proxy/remove-bg   ──→ ComfyUI (GPU 服务器)  │
│  /api/proxy/inpaint     ──→ ComfyUI (GPU 服务器)  │
│  /api/proxy/try-on      ──→ ComfyUI (GPU 服务器)  │
│  /api/proxy/faceswap    ──→ ComfyUI (GPU 服务器)  │
│  /api/proxy/upscale     ──→ ComfyUI (GPU 服务器)  │
└──────────────────────────────────────────────────┘
```

前端统一通过 `/api/proxy/*` 调用，对用户和前端组件来说无感知差异。

---

## 三、首页 6 大核心模块（对齐 MVP 实际功能）

| # | 模块名 | 描述 | 技术引擎 |
|---|--------|------|---------|
| 1 | **AI 视频工场** | 输入创意或图片，AI 生成营销短视频 | Veo 3.1 |
| 2 | **AI 绘画工作室** | 一句话生成营销海报、商品主图与创意插画 | Imagen 4.0 |
| 3 | **AI 智能编辑** | 一键抠图去背景、智能换场景、擦除多余元素 | ComfyUI + Gemini Image |
| 4 | **AI 模特换装** | 上传服装与模特照片，AI 生成换装效果 | ComfyUI Try-On |
| 5 | **AI 局部重绘** | 框选区域，AI 精准重绘 | ComfyUI Inpainting |
| 6 | **AI 营销文案** | 对话式生成爆款文案、直播话术、带货脚本 | Gemini 2.5 Flash |

---

## 四、已完成功能清单

截至 2026-03-30，以下功能已实现并可用：

### AI 功能（Google GenAI 侧全部完成）

| 功能 | 状态 | 位置 | 说明 |
|------|------|------|------|
| **文生图** | ✅ 已完成 | API: `app/api/proxy/text2img/route.ts` / 页面: `app/dashboard/art-studio/` | Imagen 4.0，含独立页面 + 历史持久化 |
| **图片编辑/换背景** | ✅ 已完成 | API: `text2img` 图编辑分支 / 弹窗: `BackgroundReplaceModal.tsx` | Gemini 2.5 Flash Image generateContent |
| **文生视频 / 图生视频** | ✅ 已完成 | API: `app/api/proxy/text2video/route.ts` / 页面: `app/dashboard/video-factory/` | Veo 3.1，时长 4/6/8s，含独立页面 + 历史持久化 |
| **AI 营销文案** | ✅ 已完成 | `app/dashboard/marketing-assistant/` + `lib/prompts/marketing-prompts.ts` | Gemini 2.5 Flash，5 套结构化 system prompt |

### 前端基础设施

| 功能 | 状态 | 说明 |
|------|------|------|
| 首页 6 模块 | ✅ 已更新 | 对齐 MVP 实际功能 |
| Gemini 模型名 | ✅ 已修复 | `gemini-2.5-flash`（对话）、`gemini-2.5-flash-image`（图编辑） |
| Veo duration 校验 | ✅ 已修复 | 只允许 4/6/8 秒 |
| API Key 管理 | ✅ 已有 | localStorage 存储，UserMenu 中配置 |
| Art Studio 独立页面 | ✅ 已有 | 左右分栏，含历史网格 |
| Video Factory 独立页面 | ✅ 已有 | 左右分栏，含视频播放器 |
| 客户端存储系统 | ✅ 已有 | `lib/storage/` 带版本化 schema |
| 访客模式 | ✅ 已有 | GuestOverlay + GuestCTAs |
| ComingSoon 占位 | ✅ 已有 | 未实现功能统一弹窗提示 |

---

## 五、待完成功能（按优先级）

### P0 第一梯队 — 等待 ComfyUI

| 功能 | 引擎 | 当前状态 | 需要做的 |
|------|------|---------|---------|
| **智能抠图** | ComfyUI (RMBG/SAM) | ❌ 等 ComfyUI | ComfyUI 抠图工作流 + `/api/proxy/remove-bg` + 前端 UI |
| **换背景升级** | ComfyUI 抠图 + 合成 | ⚠️ Gemini 基础版可用 | ComfyUI 抠图 → 合成方案，替代 Gemini prompt 编辑 |

### P1 第二梯队 — 等待 ComfyUI

| 功能 | 引擎 | 当前状态 | 需要做的 |
|------|------|---------|---------|
| **服装换装** | ComfyUI Try-On | ❌ 等 ComfyUI | 换装工作流 + `/api/proxy/try-on` + 前端（上传模特+衣服 UI） |
| **局部重绘** | ComfyUI Inpainting | ❌ 等 ComfyUI | Inpainting 工作流 + `/api/proxy/inpaint` + 前端 Canvas mask 画布 |
| **换脸** | ComfyUI (ReActor) | ❌ 等 ComfyUI | 换脸工作流 + 改造 `/api/proxy/faceswap` 指向 ComfyUI |

### P2 第三梯队 — 有就加分

| 功能 | 引擎 | 说明 |
|------|------|------|
| **风格转换** | Gemini Image / ComfyUI | 先用 Gemini prompt 编辑 |
| **高清放大** | ComfyUI (Real-ESRGAN) | 需 ComfyUI |
| **元素擦除** | Gemini Image / ComfyUI (LaMa) | 先用 Gemini prompt 编辑 |

### 前端体验优化（不依赖 ComfyUI，可立即推进）

参考外包版的业务模块，以下优化可在等待 ComfyUI 期间完成：

| 任务 | 参考来源 | 优先级 | 说明 |
|------|---------|--------|------|
| **营销助手组件拆分** | 外包版 `ChatHeader/ChatSidebar/RoleBubble` | 高 | 当前单文件 365 行，拆为独立组件提升可维护性 |
| **ChatInputBox 富工具栏** | 外包版 `ChatInputBox.tsx` | 高 | 附件上传、模板库快捷入口，提升文案助手实用性 |
| **Dashboard 数据活化** | 外包版 `getUserSummary()` | 中 | 统计卡片、最近项目改为读取 localStorage 真实生成记录，替代硬编码 demo |
| **登录/注册对接后端** | 外包版 `lib/api/auth.ts` | 中 | 替换 mock 登录，对接已有后端 JWT 流程 |
| **工具箱入口整理** | 两版对比 | 中 | 已实现的工具接入真实 AI；未实现的统一走 ComingSoon |
| **画布模式** | 外包版 `CanvasView.tsx` | 低 | 营销助手的画布视图，MVP 阶段非必须 |

---

## 六、已有可复用资产

| 资产 | 位置 | 状态 |
|------|------|------|
| 文生图 API | `app/api/proxy/text2img/route.ts` | ✅ 已在用 |
| 图片编辑 API（Gemini） | `text2img` 路由的 generateContent 分支 | ✅ 已在用 |
| 文生视频 API | `app/api/proxy/text2video/route.ts` | ✅ 已在用 |
| 视频生成表单 | `components/VideoGenerationForm.tsx` | ✅ 已在用 |
| 图片生成表单 | `components/ImageGenerationForm.tsx` | ✅ 已在用 |
| AI 对话界面 | `app/dashboard/marketing-assistant/` | ✅ 已在用 |
| 结构化 Prompt | `lib/prompts/marketing-prompts.ts` | ✅ 已在用（5 套） |
| 客户端存储 | `lib/storage/` | ✅ 已在用 |
| API Key 存储 | `components/header/UserMenu.tsx` | ✅ 已在用 |
| Art Studio 页面 | `app/dashboard/art-studio/` | ✅ 已在用 |
| Video Factory 页面 | `app/dashboard/video-factory/` | ✅ 已在用 |
| 换背景弹窗 | `components/BackgroundReplaceModal.tsx` | ✅ 已在用 |
| ComingSoon 弹窗 | `components/ComingSoonModal.tsx` | ✅ 已在用 |
| 访客模式 | `GuestOverlay.tsx` + `GuestCTAs.tsx` | ✅ 已在用 |

### 外包版可参考的资产（不直接复制，参考设计与逻辑）

| 外包版文件 | 参考价值 | V2 对应改进 |
|-----------|---------|-----------|
| `ChatInputBox.tsx` | 富输入框的交互设计（附件/模板/模型选择） | V2 营销助手增加工具栏 |
| `RoleBubble.tsx` | 消息气泡组件设计 | V2 拆分消息组件 |
| `CanvasView.tsx` | 画布模式 UI 参考 | 后续迭代参考 |
| `ChatHeader/ChatSidebar` | 聊天区域组件拆分方式 | V2 营销助手重构参考 |
| `lib/api/client.ts` | 统一 API 客户端封装 | V2 接入后端时参考 |
| `lib/api/auth.ts` | JWT 认证流程 | V2 登录对接时参考 |

---

## 七、执行节奏

### 阶段 A：前端优化（不依赖 ComfyUI，可立即开始）

> 目标：在等待 ComfyUI 部署期间，最大化利用时间优化前端体验

**AI 功能已就绪的打磨：**

- [ ] 工具箱入口整理：已实现的接入真实 AI，未实现的走 ComingSoon
- [ ] Dashboard 数据活化：统计卡片和最近项目读取 localStorage 真实生成记录
- [ ] 登录/注册对接已有后端

**营销助手升级（参考外包版）：**

- [ ] 组件拆分：从单文件拆出 ChatHeader、ChatSidebar、MessageBubble、ChatInput
- [ ] ChatInput 增加工具栏：模板库快捷入口、附件上传

### 阶段 B：ComfyUI 部署 + 接入

> 前提：GPU 服务器就绪

**ComfyUI 部署：**

- [ ] GPU 服务器安装 ComfyUI + 基础环境
- [ ] 下载模型权重（RMBG/SAM、Inpainting、Try-On、ReActor、Real-ESRGAN）
- [ ] 逐个调通工作流，封装 HTTP API

**功能接入（按顺序）：**

- [ ] 智能抠图：最简单，先验证 ComfyUI → Next.js 完整链路
- [ ] 换背景升级：ComfyUI 抠图 + 合成，替代 Gemini prompt 编辑
- [ ] 换脸：ReActor 工作流，替代旧的 175.27.193.51 服务
- [ ] 服装换装：Virtual Try-On 工作流 + 前端上传 UI
- [ ] 局部重绘：Inpainting + 前端 Canvas mask 画布

### 阶段 C：打磨 + 演示准备

- [ ] 全功能端到端测试，修复 bug
- [ ] P2 功能按余量选做（风格转换 / 高清放大 / 元素擦除）
- [ ] UI/UX 打磨，演示流程优化
- [ ] 准备演示用的 prompt 和素材（预置效果好的示例）
- [ ] 内部试用 + 收集反馈

---

## 八、风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| ComfyUI 工作流调试耗时超预期 | P0/P1 功能延迟 | 优先保证抠图（最简单），换装/重绘/换脸可后移 |
| Gemini 图编辑效果不够好 | 换背景/擦除效果差 | 后续用 ComfyUI 专业模型替代（已规划） |
| GPU 服务器网络不稳定 | ComfyUI 功能不可用 | Google GenAI 功能独立可用，不受 ComfyUI 影响 |
| 视频生成耗时长（1-3 分钟） | 演示时等待尴尬 | 提前预生成视频作为 demo 素材 |
| Gemini API Key 区域限制 | 部分网络环境无法访问 | 演示环境使用美国/新加坡节点 |
| 营销助手重构影响现有功能 | 回归 bug | 重构前确保现有功能测试通过 |

---

## 九、MVP 不做的事项（明确排除）

以下功能在 MVP 阶段**不做**，避免范围蔓延：

- 可嵌入前端架构重构
- 可复用标准化 API（后端团队后续负责）
- ComfyUI 节点可视化编排界面
- 数字人生成
- 语音生成/配音/声音复制
- 视频分析/爆款拆解
- 云端素材管理（多端同步）
- 用户权限/团队协作
- 支付/会员体系
- 批量生成能力
- 画布模式（营销助手，后续迭代考虑）
