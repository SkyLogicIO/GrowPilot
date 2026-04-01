# GrowPilot V2 — AI 功能未实现清单

> 最后更新：2026-03-31
>
> 记录所有未实现的 AI 功能，说明可用实现方式及推荐方案。
>
> 已实现的功能不在此文档范围。

---

## 一、AI创作工具 — 工具箱各 Tab

### Tab 1：AI帮我写（4 项全部未实现）

| # | 功能 | 实现方式 | 推荐方案 | 说明 |
|---|------|---------|---------|------|
| 1 | 直播话术生成 | **Gemini API**（客户端直调） | Gemini | 已有营销助手对话能力，可复用 Gemini 2.5 Flash + 结构化 prompt，难度低 |
| 2 | 带货脚本生成 | **Gemini API** | Gemini | 同上，换一套 system prompt 即可 |
| 3 | 短视频文案提取 | **Gemini API**（多模态） | Gemini | 上传视频 → Gemini 解析内容 → 提取文案。Gemini 支持视频输入，可直接做 |
| 4 | 爆款脚本仿写 | **Gemini API** | Gemini | 上传参考文案 + Gemini 改写，纯文本任务 |

**共性**：这 4 个都是纯文本生成任务，**全部可以只用 Gemini API 实现**，不需要 ComfyUI 或后端。可以做成独立弹窗或复用营销助手的对话界面。

---

### Tab 2：图像处理（7 项未实现，1 项已实现）

| # | 功能 | 实现方式 | 推荐方案 | 说明 |
|---|------|---------|---------|------|
| — | ~~通用图像编辑~~ | ~~已完成~~ | — | 已用 Gemini 2.5 Flash Image 实现多图编辑 |
| 1 | 高清放大 | **ComfyUI**（Real-ESRGAN） | ComfyUI | Gemini 无此能力，必须用 ComfyUI 专业放大模型 |
| 2 | 局部重绘 | **ComfyUI**（Inpainting）或 **Gemini Image** | ComfyUI | Gemini 可做基础版（整图编辑），但精准 mask 重绘需 ComfyUI + Canvas 画布 |
| 3 | 智能抠图 | **ComfyUI**（RMBG/SAM）或 **Gemini Image** | ComfyUI | Gemini 无法输出透明通道 mask。ComfyUI RMBG 精度更高，且需要 mask 输出用于后续合成 |
| 4 | AI消除 | **Gemini Image** 或 **ComfyUI**（LaMa） | Gemini（先上线） | 用 prompt "remove XXX" 即可实现基础版。ComfyUI LaMa 精度更好，后续补强 |
| 5 | 智能扩图 | **Gemini Image** | Gemini | 用 prompt 描述扩展区域即可，Gemini 图编辑可覆盖 |
| 6 | 元素擦除 | **Gemini Image** 或 **ComfyUI**（LaMa） | Gemini（先上线） | 与 AI消除 类似，先用 Gemini prompt 编辑上线 |
| 7 | 线稿提取 | **ComfyUI**（LineART 模型） | ComfyUI | Gemini 效果不稳定，专业线稿提取需 ComfyUI ControlNet-LineART 模型 |

**优先级建议**：
- **可立即做**（Gemini）：AI消除、元素擦除、智能扩图 — 复用 `editImage()` 即可
- **等 ComfyUI**：高清放大、智能抠图、线稿提取 — Gemini 做不了或效果差
- **中间态**：局部重绘 — Gemini 先做基础版，ComfyUI 补精准 mask 版

---

### Tab 3：AI图像工具（7 项未实现，1 项已实现）

| # | 功能 | 实现方式 | 推荐方案 | 说明 |
|---|------|---------|---------|------|
| — | ~~换背景~~ | ~~已完成~~ | — | 已用 Gemini 2.5 Flash Image 实现 |
| 1 | 万物迁移 | **Gemini Image** | Gemini | 用 prompt 描述迁移目标，类似换背景逻辑，难度低 |
| 2 | 换脸 | **ComfyUI**（ReActor） | ComfyUI | Gemini 无法做精准换脸，必须 ComfyUI ReActor 模型 |
| 3 | 换装 | **ComfyUI**（Virtual Try-On） | ComfyUI | Gemini 无法做精准换装，必须 ComfyUI Try-On 模型 + 上传模特/衣服 UI |
| 4 | 手部修复 | **ComfyUI**（Hand Refiner） | ComfyUI | 专项模型，Gemini 无此能力 |
| 5 | 肤质增强 | **ComfyUI**（GFPGAN/CodeFormer）或 **Gemini Image** | Gemini（先上线） | Gemini 可做基础版（prompt "enhance skin quality"），ComfyUI 精度更好 |
| 6 | 人像调节 | **Gemini Image** | Gemini | prompt 描述调节方向（如"让表情更微笑"），Gemini 图编辑可覆盖 |
| 7 | 产品精修 | **Gemini Image** 或 **ComfyUI** | Gemini（先上线） | 产品图美化，Gemini 可做基础版 |

**优先级建议**：
- **可立即做**（Gemini）：万物迁移、肤质增强、人像调节、产品精修
- **等 ComfyUI**：换脸、换装、手部修复

---

### Tab 4：视频分析（8 项全部未实现）

| # | 功能 | 实现方式 | 推荐方案 | 说明 |
|---|------|---------|---------|------|
| 1 | 声音提取 | **后端 FFmpeg** | 后端 | 视频音轨提取，FFmpeg 命令即可，非 AI 任务 |
| 2 | ASR工具 | **Gemini API**（多模态）或 **后端 Whisper** | Gemini | Gemini 可直接解析视频/音频输出文字，Whisper 精度更好 |
| 3 | 背景替换（视频） | **ComfyUI**（视频处理）或 **Gemini** | 待评估 | 视频逐帧处理，工程量大。Gemini 只能处理单帧 |
| 4 | 数字人 | **第三方 API** | 第三方 | 需要专业数字人生成服务（如 HeyGen/D-ID），自研成本极高 |
| 5 | 智能字幕 | **Gemini API** + **后端** | Gemini | ASR → 生成字幕文件，Gemini 做识别，后端做时间轴对齐 |
| 6 | 视频去水印 | **ComfyUI**（Inpainting） | ComfyUI | 逐帧 inpainting 去水印，需 ComfyUI |
| 7 | 视频增强 | **ComfyUI**（Real-ESRGAN 视频） | ComfyUI | 视频逐帧超分辨率，需 GPU 处理 |
| 8 | 镜头分割 | **后端 PySceneDetect** | 后端 | 场景检测算法，非 AI 也可做 |

**优先级建议**：
- **可立即做**（Gemini）：ASR工具 — 上传视频/音频 → Gemini 输出文字
- **需后端**：声音提取（FFmpeg）、镜头分割（PySceneDetect）
- **需 ComfyUI**：视频背景替换、视频去水印、视频增强
- **需第三方**：数字人（建议接入 HeyGen/D-ID API）
- **需组合**：智能字幕（Gemini ASR + 后端时间轴）

---

### Tab 5：语音生成（3 项全部未实现）

> 当前状态：UI 外壳完整（发音人列表、控制面板、语音复制 tab），但"立即合成"按钮无 onClick，未接入任何 TTS 服务。

| # | 功能 | 实现方式 | 推荐方案 | 说明 |
|---|------|---------|---------|------|
| 1 | 普通话发音人 | **第三方 TTS API** | 阿里云/讯飞/Google TTS | 自研 TTS 不现实，接入成熟 TTS 服务。需要后端代理 API Key |
| 2 | 多语言发音人 | **第三方 TTS API** | Google TTS / Azure | 多语言支持，推荐 Azure 或 Google Cloud TTS |
| 3 | 语音复制 | **第三方 Voice Cloning API** | 讯飞/Coqui/ElevenLabs | 语音克隆是专项能力，需专业服务。效果：ElevenLabs > 讯飞 > 开源方案 |

**共性**：语音生成**不能只用 Gemini API**。Gemini 虽然有多模态能力，但不提供 TTS 输出。需要接入专业 TTS 服务，且通常需要后端代理（保护 API Key、处理音频流）。

**实现路径**：
1. 选定 TTS 服务商，开通 API
2. 后端添加 TTS 代理接口（或 Next.js API Route，但当前项目是 static export）
3. 前端 VoiceControlPanel 的"立即合成"按钮接入 API，获取音频 URL 播放

---

## 二、Gemini API 可立即实现的功能汇总

以下功能**只需 Gemini API Key**，无需 ComfyUI 或后端，可立即开发：

| 功能 | 所在 Tab | 难度 | 实现方式 |
|------|---------|------|---------|
| AI消除 | 图像处理 | 低 | 复用 `editImage()`，prompt "remove XXX from this image" |
| 元素擦除 | 图像处理 | 低 | 同上 |
| 智能扩图 | 图像处理 | 低 | 复用 `editImage()`，prompt 描述扩展内容 |
| 万物迁移 | AI图像工具 | 低 | 复用 `editImage()`，prompt 描述迁移目标 |
| 肤质增强 | AI图像工具 | 低 | 复用 `editImage()`，prompt "enhance skin quality" |
| 人像调节 | AI图像工具 | 中 | 复用 `editImage()`，需设计交互（选择调节方向） |
| 产品精修 | AI图像工具 | 低 | 复用 `editImage()`，prompt "professional product photo retouching" |
| 直播话术生成 | AI帮我写 | 中 | 复用 Gemini 对话 + 结构化 prompt，需设计独立弹窗 |
| 带货脚本生成 | AI帮我写 | 中 | 同上 |
| 短视频文案提取 | AI帮我写 | 中 | Gemini 视频理解 + 文案提取 |
| 爆款脚本仿写 | AI帮我写 | 低 | Gemini 文本改写 |
| ASR工具 | 视频分析 | 中 | Gemini 音频/视频 → 文字 |

---

## 三、必须依赖 ComfyUI 的功能

| 功能 | 所需模型 | 优先级 | 说明 |
|------|---------|--------|------|
| 智能抠图 | RMBG / SAM | 高 | 需输出透明 mask，Gemini 做不到 |
| 高清放大 | Real-ESRGAN | 高 | 专用超分辨率模型 |
| 换脸 | ReActor | 高 | 精准换脸 |
| 换装 | Virtual Try-On | 中 | 精准换装 |
| 局部重绘（精准版） | Inpainting (LaMa/SD) | 中 | Canvas mask + 精准重绘 |
| 线稿提取 | ControlNet-LineART | 低 | 专业线稿 |
| 视频去水印 | Inpainting 逐帧 | 低 | 工程量大 |
| 视频增强 | Real-ESRGAN 逐帧 | 低 | 工程量大 |
| 手部修复 | Hand Refiner | 低 | 专项模型 |

---

## 四、需要后端/第三方服务的功能

| 功能 | 依赖 | 说明 |
|------|------|------|
| 语音生成（TTS） | 第三方 TTS API + 后端代理 | 阿里云/讯飞/Google TTS，需后端保护 Key |
| 语音复制（Cloning） | 第三方 Voice Cloning API | ElevenLabs/讯飞，需付费服务 |
| 数字人 | 第三方 API | HeyGen/D-ID，自研不现实 |
| 声音提取 | 后端 FFmpeg | 非 AI，但需要服务端处理 |
| 镜头分割 | 后端 PySceneDetect | 非 AI，需要服务端处理 |
| 智能字幕 | Gemini ASR + 后端 | Gemini 做识别 + 后端做时间轴对齐 |

---

## 五、更新日志

| 日期 | 更新内容 |
|------|---------|
| 2026-03-31 | 初始版本，覆盖 AI创作工具 5 个 Tab 共 30 项功能的未实现状态 |
