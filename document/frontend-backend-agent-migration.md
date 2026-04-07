# 前端 → 后端 AI 服务迁移分析

## 背景

当前前端直接在浏览器调用 Google GenAI SDK，用户自行管理 API Key。计划改为由后端统一管理 API Key，前端通过后端 API 使用 AI 能力。

本文档覆盖两个迁移场景：
1. 电商智能体（Agent 对话 + 自动生图/生视频）
2. AI 创作工具板块（图像编辑、文生图、视频生成等）

## 后端现有能力

### Agent 系统（3 个内置 Agent）

| Agent ID | 功能 | 端点 |
|---|---|---|
| marketing-assistant | AI 电商营销助手 | `POST /api/v1/agents/marketing-assistant/generate` |
| prompt-master | 改图提示词大师 | `POST /api/v1/agents/prompt-master/optimize` |
| image-expander | 文生图扩写助手 | `POST /api/v1/agents/image-expander/expand` |

通用 Agent 对话接口：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/v1/agents` | 列出所有 Agent |
| POST | `/api/v1/agents/{agent_id}/chat` | Agent 对话（非流式） |
| POST | `/api/v1/agents/{agent_id}/stream` | Agent 对话（SSE 流式） |

### AI Tools（前端已封装，`lib/api/ai-tools.ts`）

| 函数 | 路径 | 请求参数 | 说明 |
|---|---|---|---|
| `textToImage()` | `/api/v1/ai-tools/text-to-image` | prompt, width, height, steps, cfg_scale, model_name | 文生图 |
| `imageToImage()` | `/api/v1/ai-tools/image-to-image` | image_url, prompt, model_name | 图生图（单张） |
| `textToVideo()` | `/api/v1/ai-tools/text-to-video` | prompt, fps, duration, model_name | 文生视频 |
| `imageToVideo()` | `/api/v1/ai-tools/image-to-video` | image_url, prompt, fps, duration, model_name | 图生视频 |
| `inpaint()` | `/api/v1/ai-tools/inpaint` | image_url, mask_url, prompt, model_name | 局部重绘 |
| `frameToVideo()` | `/api/v1/ai-tools/frame-to-video` | start_frame_url, end_frame_url, prompt, fps, duration, model_name | 帧序列生视频 |

所有 AI Tools 均为**异步任务模式**：提交返回 `TaskCreatedInfo`（含 task_id），通过 `GET /api/v1/ai-tools/tasks/:task_id` 轮询 `TaskDetailInfo`（含 progress、result_url）。

任务轮询基础设施已就绪：`hooks/useTaskPolling.ts`（可配置间隔、最大次数、终态检测）。

---

## 一、电商智能体迁移

### 1.1 生图：同步 → 异步

**现状：** `chatWithMedia()` 中 `await generateImage()` 同步等待 Imagen 返回 base64，图片和文本同一次响应出现。

**后端：** `textToImage()` 提交任务 → 轮询取结果。

**改造方案：**

图片生成改为与视频一致的占位卡片模式：

```
提交任务 → 占位卡片（loading） → 轮询 /tasks/:id → 完成后更新 dataUrl
```

- `MediaGallery` 的 `MediaCard` 需增加图片 loading 态（当前只有视频 loading 态）

### 1.2 后端 Agent 不识别 `[IMAGE:]` / `[VIDEO:]` 标记

**现状：** 前端 `MEDIA_INSTRUCTION` 教 AI 输出 `[IMAGE:]` / `[VIDEO:]` 标记触发媒体生成。

**后端：** `marketing-assistant` 有自己的 System Prompt，不含标记指令。

**改造方案（二选一）：**

- **方案 A：** 后端 Agent System Prompt 追加标记指令（推荐）
- **方案 B：** 后端支持前端传入自定义 `system_instruction`

### 1.3 前端直连函数替换

| 前端当前（`lib/ai.ts`） | 替换为（后端 API） |
|---|---|
| `generateImage()` → Imagen 直连 | `textToImage()` + `useTaskPolling` 轮询 |
| `generateVideo()` → Veo 直连 | `textToVideo()` + `useTaskPolling` 轮询 |
| `chatWithGemini()` → Gemini 直连 | `POST /agents/{id}/chat` 或 `/stream` |

### 1.4 不需要改动的部分

- `[IMAGE:]` / `[VIDEO:]` 标记解析逻辑（正则提取）
- `useMediaStore` 媒体库管理
- `MediaGallery` 视频卡片渲染
- `lib/storage/ecom-chat.ts` 线程持久化
- UI 组件结构（ChatBubble、ThreadSelector、MessageRenderer）

---

## 二、AI 创作工具板块迁移

### 2.1 前端工具清单与后端映射

前端共 31 个工具入口，按对接状态分类：

#### 可替换为后端 API（4 个）

| 前端工具 | 当前实现 | 后端替换 | 差异与注意事项 |
|---|---|---|---|
| 换背景 | `editImage()` → gemini-2.5-flash-image，同步返回 | `imageToImage()` | 后端需 image_url 而非 File；需增加 loading 态 |
| 通用图像编辑 | `editImages()` → gemini-2.5-flash-image，支持 1-3 张图 | `imageToImage()` | **后端仅支持单张图片**，多图编辑无法直接替换 |
| 文生图（Art Studio） | 已有双路径：登录走后端 `textToImage()`，访客走 SDK | 不需改动 | 登录态已走后端，保持现状即可 |
| 局部重绘（占位） | 无实现，弹出"即将上线" | `inpaint()` | 需前端实现 mask 绘制 UI |

#### 可通过后端新增能力（2 个）

| 前端工具 | 后端 API | 说明 |
|---|---|---|
| 文生视频（占位） | `textToVideo()` | 新增功能，复用 `useTaskPolling` |
| 图生视频（占位） | `imageToVideo()` | 新增功能，复用 `useTaskPolling` |

#### 前端实现但后端无对应（1 个）

| 前端工具 | 现状 | 说明 |
|---|---|---|
| AI 换脸 | 代理路由已删除，不可用 | 后端无换脸 API。若需保留需后端新增接口 |

#### UI 已有但非真实 AI（2 个）

| 前端工具 | 现状 | 说明 |
|---|---|---|
| 语音生成 | 无 click handler | 需后端 TTS API，当前后端未提供 |
| 语音复制 | Web Audio 正弦波 mock | 需后端 TTS API，当前后端未提供 |

#### 纯占位 — 无后端对应（22 个）

直播话术生成、带货脚本生成、短视频文案提取、爆款脚本仿写、高清放大、智能抠图、AI 消除、智能扩图、元素擦除、线稿提取、万物迁移、换装、手部修复、肤质增强、人像调节、产品精修、声音提取、ASR 工具、背景替换、数字人、智能字幕、视频去水印、视频增强、镜头分割。

这些工具后端无对应接口，保持"即将上线"占位即可。

### 2.2 核心差异：image_url vs File

当前前端图像工具（`BackgroundReplaceModal`、`ImageEditModal`）直接将用户上传的 `File` 对象以 base64 发送给 Gemini SDK。

后端 `imageToImage()` 和 `inpaint()` 要求 `image_url`（URL 字符串）。

**已解决：后端已有预签名上传接口**

```
前端 → POST /api/v1/files/upload/presigned（获取签名 URL）  ← JWT 认证
前端 → PUT 签名 URL（直传云存储，不经后端）
前端 → 拿到的文件 URL 传给 AI Tools（image_url）
```

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/v1/files/upload/presigned` | 获取单个预签名上传 URL |
| POST | `/api/v1/files/upload/presigned/batch` | 批量获取预签名 URL |
| GET | `/api/v1/files/upload/config` | 获取上传配置 |

支持 GCS / OSS / S3 / Local 四种存储后端。

前端图像工具改造为：File → presigned 上传 → image_url → `imageToImage()` / `inpaint()`

### 2.3 核心差异：同步等待 → 异步轮询

当前前端 `editImage()` / `editImages()` 是 `async/await` 同步等待返回结果。后端 AI Tools 是提交任务 → 轮询。

**改造方案：**

`BackgroundReplaceModal` 和 `ImageEditModal` 改为：
1. 提交任务后显示 loading 进度条（复用 `useTaskPolling`）
2. 轮询完成后用 `result_url` 显示结果图

### 2.4 通用图像编辑的多图问题

前端 `editImages()` 支持传入 1-3 张图片 + prompt，Gemini 基于多图理解进行编辑。

后端 `imageToImage()` 仅支持单张 `image_url`。

**处理方案（二选一）：**

- **方案 A：** 降级为单图编辑，去掉多图上传 UI（简单但功能缩减）
- **方案 B：** 后端新增多图编辑接口，或在 Agent 对话中处理（Gemini 理解多图后生成单图编辑指令）

---

## 三、需后端确认的技术细节

| 问题 | 影响范围 |
|---|---|
| Agent `/chat` 和 `/stream` 的请求/响应格式 | 电商智能体对接 |
| AI Tools 返回的图片/视频格式（result_url 是临时链接还是永久链接） | 所有工具的结果展示 |
| ~~是否提供图片上传接口~~ | ✅ 已确认，`/api/v1/files/upload/presigned` 预签名方案 |
| `imageToImage` 是否可扩展支持多图输入 | 通用图像编辑功能 |
| 认证 token 的请求头格式 | `lib/api/client.ts` |
| 任务轮询推荐间隔 | `useTaskPolling` 配置 |

---

## 四、改造优先级

| 优先级 | 改造项 | 涉及文件 |
|---|---|---|
| **P0** | 确认后端接口文档（第三节） | 无 |
| **P1** | 电商智能体：`chatWithGemini()` → 后端 Agent 对话 | `lib/ai.ts`、`EcomAgentPageClient.tsx` |
| **P1** | 电商智能体：同步 `[IMAGE:]` 标记指令到后端 Agent | 后端 |
| ~~P1~~ | ~~确认图片上传方案~~ | ✅ 已确认，后端有 presigned 上传接口 |
| **P2** | 电商智能体：`generateImage()` → `textToImage()` + 轮询 | `lib/ai.ts`、`MediaGallery.tsx` |
| **P2** | 电商智能体：`generateVideo()` → `textToVideo()` + 轮询 | `lib/ai.ts` |
| **P2** | 换背景：`editImage()` → `imageToImage()` + 轮询 | `BackgroundReplaceModal.tsx` |
| **P2** | 通用图像编辑：评估多图降级或后端扩展 | `ImageEditModal.tsx` |
| **P3** | 新增：局部重绘工具 UI（`inpaint` 接口已就绪） | 新组件 |
| **P3** | 新增：文生视频 / 图生视频工具 UI | 新组件 |
| **P4** | 移除前端 `@google/genai` 依赖 | `package.json` |
