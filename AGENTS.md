# GrowPilot 项目说明

## Next.js 文档优先

进行任何 Next.js 相关工作前，必须先在
`node_modules/next/dist/docs/` 中查找并阅读对应文档。
涉及 Next.js 的判断、实现方案与问题分析，应以本地文档为准，不应依赖模型记忆或经验性推断。

在相关工具可用时，遵循以下优先级：

- `next-devtools`：用于获取 Next.js 运行态信息、构建错误、路由状态、RSC、metadata 等框架级诊断信息。
- `playwright`：用于验证页面真实行为、交互流程、响应式表现、截图与问题复现。
- `context7`：用于查询外部库、SDK、框架的最新官方文档与用法。
- 若本地代码、项目文档或本地 Next.js 文档已经足以回答问题，应优先使用本地信息，不应先查外部资料。

## 项目概况

GrowPilot 是一个面向营销创作者的 AI 内容创作平台，当前重点面向电商卖家场景，核心目标是帮助用户通过对话式方式生成营销文案、图片与视频素材。

- 技术栈：Next.js 16.2 App Router、React 19、Tailwind CSS 4、TypeScript
- 包管理器：`pnpm`
- 开发命令：`pnpm dev`
- 开发端口：`3005`
- 构建命令：`next build && tar -czf next.tar.gz -C out .`
- 运行配置：`output: "export"`，并启用了 `allowedDevOrigins`
- 字体资源：`public/fonts/RubikVariable.ttf`
- 视觉方向：深色、蓝色系、玻璃质感，避免通用化的“AI 工具”界面风格

## 强约束

- 所有源码文件统一使用 TypeScript（`.ts` / `.tsx`）。
- 样式应使用 Tailwind CSS 4 utility classes，并遵循现有深色主题体系。
- 本项目为静态导出应用，禁止引入依赖服务端运行时的 Next.js 能力。
  包括但不限于：API Routes、Route Handlers、Server Actions、依赖 rewrites 的运行时流程，以及其他仅在服务端环境成立的实现假设。
- 新功能不得使用已废弃的 `/api/v1/ai-tools/*` 路径。
- 优先复用现有文件、hooks、工具函数与目录结构，不应无必要地新建文件或重复实现既有逻辑。
- 非确有必要，不要新增依赖。

## 架构说明

本项目以前端为主导，后端主要承担认证、文件服务与 AI 能力代理。大量用户侧状态保存在客户端，并通过 `localStorage` 持久化。

### 页面组织方式

- 路由通常采用“薄入口 + 客户端主体”的结构：
  - `page.tsx`：路由入口，通常保持精简
  - `*PageClient.tsx`：承载主要的交互逻辑、状态与请求流程
- 除非有明确理由，不应在 `page.tsx` 中编写复杂业务逻辑。

### 认证与客户端状态

- 登录入口：`components/Login.tsx`
- HTTP 封装：`lib/api/client.ts`
- 生成项目存储：`lib/storage/index.ts`
- 电商智能体对话存储：`lib/storage/ecom-chat.ts`

常用全局事件：

- `growpilot:login`
- `growpilot:logout`
- `growpilot:unauthorized`

## AI 与 API 接入

本项目当前存在两类主要接入路径。

### 1. GenAI 代理路径

- 主要文件：`lib/ai.ts`
- SDK：`@google/genai`
- 基础路径：`NEXT_PUBLIC_API_BASE_URL + /api/v1/genai`
- 用途：图片生成、视频生成、多模态对话
- 认证方式：JWT，通过 `Authorization` header 传递

涉及图像、视频、多模态生成时，默认优先检查并沿用该路径，除非代码库中已有更明确且更合适的既有实现。

### 2. REST API 路径

- 主要目录：`lib/api/*`
- 关键文件：
  - `lib/api/auth.ts`
  - `lib/api/gemini.ts`
  - `lib/api/agents.ts`
  - `lib/api/files.ts`

接口约定：

- 请求体通常使用 camelCase
- 响应字段可能使用 snake_case，例如 `access_url`
- Swagger 文档地址：`http://35.240.178.148:10086/swagger/index.html`

外部代理：

- `faceswap` / `imageedit` 转发至 `175.27.193.51:3008`

## 主要产品区域

- `/`：落地页
- `/dashboard`：Dashboard 首页
- `/dashboard/ecom-agent`：核心功能区，对话式生成文案、图片与视频
- `/dashboard/video-factory`：视频生成工作区
- `/dashboard/art-studio`：图像生成工作区
- `/dashboard/tools`：AI 工具区
- `/dashboard/assets/*`：资产中心
- `/dashboard/ideas`：灵感发现区
- `/dashboard/marketing-assistant`：营销助手流程
- `/dashboard/project`：项目容器

部分页面或模块仍包含 demo 数据、mock 数据或占位逻辑。判断功能是否真实接通后端前，必须先检查当前实现，不应仅凭界面表现作出结论。

## 电商智能体说明

`/dashboard/ecom-agent` 是当前最核心的产品区域，应优先理解其现有实现与交互目标。

- 主文件：`app/dashboard/ecom-agent/EcomAgentPageClient.tsx`
- 右侧素材区：`app/dashboard/ecom-agent/MediaGallery.tsx`
- Prompt 规则：`lib/prompts/marketing-prompts.ts`
- 线程持久化：`lib/storage/ecom-chat.ts`
- 媒体状态管理：`hooks/useMediaStore.ts`

当前实现特征：

- 对话线程文本保存在 `localStorage`
- 对话中生成的媒体与线程文本分开管理
- 助手可在回复中输出 `[IMAGE: ...]` 与 `[VIDEO: ...]` 标签，前端负责解析并触发生成任务
- 右侧区域目前更接近“素材展示区”，尚未完全达到“可视化创作工作区”的成熟形态

如需迭代该区域，应优先从真实创作工作流角度思考，包括但不限于：
brief、当前主资产、任务状态、版本关系、后续动作、项目沉淀与交付链路，而不应仅停留在缩略图展示层面。

## 设计方向

本项目应避免落入同质化的“AI 工具”审美。

- UI 开发时，必须参考 `.agents/skills/frontend-design/` 中的设计指引
- 若任务不是整体改版，应尽量延续现有深色蓝调、玻璃质感、强层次感的视觉语言
- 强调明确的信息层级、稳定的视觉节奏和有目的的动效
- 不要默认采用通用后台模板式布局或缺乏辨识度的卡片堆叠方案

## 工作原则

- 在对项目行为作出判断前，必须先阅读相关代码与配置。
- 对于被标记为 `disabled`、占位中或明显未接线的功能，应视为未完整实现。
- 不得虚构接口、路由、数据结构或后端能力。
- 优先产出精简、正确、可运行的实现，不应无必要地引入抽象或过度设计。
- 若本地代码与文档已经足够支撑结论，不应额外查询外部资料。

## 参考资料

- 后端 SDK 配置指南：
  `/Users/wuque/Project/growpliot-server/前端SDK配置指南.md`
