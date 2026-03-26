# GrowPilot MVP 开发计划

> 最后更新：2026-03-21
>
> 目标：短平快交付 AI 视觉营销工具 MVP，面向电商/设计客户

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
| Tailwind CSS | 4 | 样式（深色主题） |
| TypeScript | 5+ | 全项目统一语言 |
| pnpm | — | 包管理器 |

### AI 服务（双引擎）

| 引擎 | 负责领域 | 具体模型 |
|------|---------|---------|
| **Google GenAI** | 生成类（从无到有） | Imagen 4.0（文生图）、Imagen 3.0 capability（图编辑）、Veo 3.1（生视频）、Gemini 2.5 Flash（对话文案） |
| **ComfyUI** | 编辑类（精细操作） | RMBG/SAM（抠图）、Inpainting（局部重绘）、Virtual Try-On（换装）、Real-ESRGAN（高清放大） |

### 双引擎分工原则

- **Google GenAI 独占**：文生图、文生视频/图生视频、对话式文案 — ComfyUI 做不了或做不好
- **ComfyUI 独占**：专业抠图、服装换装、mask 局部重绘、高清放大 — Google GenAI 做不了
- **两者都能做**：换背景、风格转换、元素擦除 — 先用 Imagen 上线，后续 ComfyUI 补强精度

### 架构模式

```
┌── Next.js 前端 ──────────────────────────────────┐
│                                                  │
│  "生成类"功能                    "编辑类"功能        │
│   ↓                             ↓                │
│  /api/proxy/text2img    ──→ Google GenAI         │
│  /api/proxy/text2video  ──→ Google GenAI         │
│  /api/proxy/chat        ──→ Google GenAI         │
│                                                  │
│  /api/proxy/remove-bg   ──→ ComfyUI (GPU 服务器)  │
│  /api/proxy/inpaint     ──→ ComfyUI (GPU 服务器)  │
│  /api/proxy/try-on      ──→ ComfyUI (GPU 服务器)  │
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
| 3 | **AI 智能编辑** | 一键抠图去背景、智能换场景、擦除多余元素 | ComfyUI + Imagen 3.0 |
| 4 | **AI 模特换装** | 上传服装与模特照片，AI 生成换装效果 | ComfyUI Try-On |
| 5 | **AI 局部重绘** | 框选区域，AI 精准重绘 | ComfyUI Inpainting |
| 6 | **AI 营销文案** | 对话式生成爆款文案、直播话术、带货脚本 | Gemini 2.5 Flash |

---

## 四、功能优先级（三梯队）

### P0 第一梯队 — 核心功能，展示关键技术能力

| 功能 | 引擎 | 当前状态 | 需要做的 |
|------|------|---------|---------|
| **文生图** | Imagen 4.0 | ✅ API + 前端表单已跑通 | 完善 UI，从 NewProjectModal 提供独立入口 |
| **文生视频 / 图生视频** | Veo 3.1 | ✅ API + 前端表单已跑通 | 完善 UI，从 NewProjectModal 提供独立入口 |
| **智能抠图** | ComfyUI (RMBG/SAM) | ❌ 未实现 | 部署 ComfyUI + 新建抠图工作流 + 新 API + 新前端 |
| **换背景** | ComfyUI 抠图 + Imagen 编辑 | ❌ 未实现（Imagen API 可复用） | 新前端 UI，先用 Imagen prompt 编辑上线，后续 ComfyUI 补强 |

### P1 第二梯队 — 显示专业深度

| 功能 | 引擎 | 当前状态 | 需要做的 |
|------|------|---------|---------|
| **服装换装** | ComfyUI Try-On | ❌ 未实现 | ComfyUI 换装工作流 + 新 API + 新前端（上传模特+衣服） |
| **局部重绘** | ComfyUI Inpainting | ❌ 未实现 | ComfyUI Inpainting 工作流 + 新 API + 前端 mask 画布组件 |
| **AI 营销文案** | Gemini 2.5 Flash | ⚠️ 基础对话可用，预设模板需补完 | 为 5 个工具模式写专用 system prompt，连通模板功能 |

### P2 第三梯队 — 有就加分

| 功能 | 引擎 | 说明 |
|------|------|------|
| **风格转换** | Imagen 3.0 / ComfyUI | 先用 Imagen prompt 编辑，效果不够再上 ComfyUI |
| **高清放大** | ComfyUI (Real-ESRGAN) | 需 ComfyUI |
| **元素擦除** | Imagen 3.0 / ComfyUI (LaMa) | 先用 Imagen prompt 编辑 |

---

## 五、基础设施任务

| 任务 | 说明 | 优先级 |
|------|------|--------|
| **登录/注册** | 对接已有后端，前端集成真实登录流程，替换当前 mock | 必做 |
| **API Key 管理** | 用户自行提供 Gemini API Key（MVP 试用模式），保存在 localStorage | 已有 |
| **生成结果持久化** | localStorage 存储生成历史，支持查看和下载 | 必做 |
| **隐藏空壳入口** | 将未实现功能的 UI 入口暂时隐藏，确保演示内容完整可用 | 必做 |
| **Gemini 模型名更新** | `gemini-2.5-flash-preview-05-20` → `gemini-2.5-flash` | ✅ 已修复 |

---

## 六、已有可复用资产

| 资产 | 位置 | 复用方式 |
|------|------|---------|
| 文生图 API | `app/api/proxy/text2img/route.ts` | 直接复用，Imagen 4.0 文生图 + Imagen 3.0 图编辑 |
| 文生视频 API | `app/api/proxy/text2video/route.ts` | 直接复用，Veo 3.1 含轮询逻辑 |
| 视频生成表单 | `components/VideoGenerationForm.tsx` | 直接复用，含模型/时长/分辨率/比例选择 |
| 图片生成表单 | `components/ImageGenerationForm.tsx` | 直接复用，含 prompt + 参考图上传 |
| AI 对话界面 | `app/dashboard/marketing-assistant/` | 部分复用，基础聊天框架完整，需补 system prompt |
| 项目骨架 | Next.js 16.2 + Tailwind 4 + 深色主题 | 直接复用 |
| API Key 存储 | `components/header/UserMenu.tsx` | 直接复用，localStorage 读写 |

---

## 七、执行节奏（3 周）

### 第 1 周：Google GenAI 功能上线 + ComfyUI 并行部署

**前端开发（Google GenAI 相关）：**

- [ ] 完善"AI 视频工场"独立页面/入口，复用 VideoGenerationForm
- [ ] 完善"AI 绘画工作室"独立页面/入口，复用 ImageGenerationForm
- [ ] 补完"AI 营销文案"5 个预设模板的 system prompt
- [ ] 实现"换背景"基础版（Imagen prompt 编辑 + 新 UI）
- [ ] 登录/注册对接已有后端
- [ ] 生成结果 localStorage 持久化
- [ ] 隐藏空壳入口（声音生成、数字人、视频分析等）
- [ ] 首页 6 模块已更新 ✅

**ComfyUI 部署（并行推进）：**

- [ ] GPU 服务器安装 ComfyUI + 基础环境
- [ ] 下载所需模型权重（RMBG/SAM、Inpainting、Try-On、Real-ESRGAN）
- [ ] 调通"智能抠图"工作流
- [ ] 封装 ComfyUI API 供 Next.js 调用

### 第 2 周：ComfyUI 功能接入 + 联调

- [ ] "智能抠图"前端 + API 联调上线
- [ ] "换背景"升级为 ComfyUI 抠图 + 合成方案
- [ ] "服装换装"ComfyUI 工作流 + 前端（上传模特+衣服 UI）
- [ ] "局部重绘"ComfyUI Inpainting + 前端 mask 画布组件
- [ ] 各功能端到端测试

### 第 3 周：打磨 + 演示准备

- [ ] 全功能联调测试，修复 bug
- [ ] P2 功能按时间余量选做（风格转换 / 高清放大 / 元素擦除）
- [ ] UI/UX 打磨，演示流程优化
- [ ] 准备演示用的 prompt 和素材（预置效果好的示例）
- [ ] 内部试用 + 收集反馈

---

## 八、风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| ComfyUI 工作流调试耗时超预期 | P1 功能延迟 | 优先保证抠图（最简单），换装/重绘可后移 |
| Imagen 编辑效果不够好 | 换背景/擦除效果差 | 后续用 ComfyUI 专业模型替代 |
| GPU 服务器网络不稳定 | ComfyUI 功能不可用 | 确保 Google GenAI 功能独立可用，不受 ComfyUI 影响 |
| 视频生成耗时长（1-3 分钟） | 演示时等待时间过长，影响演示节奏 | 提前预生成视频作为 demo 素材，实时生成作为补充展示 |
| Gemini API Key 区域限制 | 部分网络环境无法访问 | 确保演示环境使用美国/新加坡节点 |

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
