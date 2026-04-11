# 电商智能体 Konva 最小骨架 PR 指导文档

> 适用对象：GLM-5、Claude Code、Codex 等 AI 编码工具
>
> 项目：`growpilot-v2`
>
> 最后更新：2026-04-11

---

## 一、文档目的

本文档用于指导实现“电商智能体右侧 Konva 画布最小骨架 PR”。

目标不是一次性做完整设计器，而是在当前仓库基础上，先落一个可运行、可扩展、边界清晰的最小版本，方便后续继续迭代。

这份文档面向 AI 编码工具，要求：

- 能直接按文档开始改代码
- 不依赖额外口头补充
- 明确哪些必须做，哪些不要做
- 明确优先改哪些文件
- 明确什么叫“本 PR 完成”

---

## 二、任务背景

当前电商智能体页面入口位于：

- `app/dashboard/ecom-agent/EcomAgentPageClient.tsx`

当前右侧区域已经不是早期的 `MediaGallery`，而是现有工作区结构：

- `components/workspace/WorkspacePanel.tsx`
- `components/workspace/WorkspaceHeader.tsx`
- `components/workspace/WorkspacePrimaryCanvas.tsx`
- `components/workspace/WorkspaceJobTimeline.tsx`
- `components/workspace/WorkspaceAssetRail.tsx`
- `components/workspace/useWorkspaceState.ts`

当前现状：

1. 右侧已经具备“工作区壳子”，但中间主区域本质上仍是单资产预览器。
2. 当前没有真正的画布状态，没有图层、选区、缩放、拖拽、导出。
3. 线程文本保存在 `localStorage`，但媒体与未来画布状态仍偏内存态。
4. 这意味着如果直接堆 Konva UI，不补最小持久化，刷新后体验会断裂。

因此，本次 PR 的定位是：

- 不推翻现有工作区布局
- 不做完整 Figma 式设计器
- 仅把右侧中间主区域升级为“最小可编辑画板”

---

## 三、本 PR 的核心目标

本 PR 只做最小闭环，必须满足以下四点：

1. 用户可以基于当前选中图片进入一个 Konva 画板。
2. 用户可以在画板中对图片进行基础操作：选中、拖拽、缩放。
3. 用户可以把画板导出为一张新图片。
4. 导出的结果可以回流到现有工作区资产列表中。

换句话说，本 PR 完成后，右侧应从“预览一张图”升级为“以一张图为基础做最小二次编辑”。

---

## 四、明确不在本 PR 内的内容

以下内容本 PR 不做：

- 完整图层面板
- 文本编辑器
- 多元素模板系统
- 视频画布编辑
- 多画板管理
- 无限画布
- 撤销重做历史
- 后端持久化
- 跨设备同步
- AI 局部重绘
- 复杂滤镜系统
- 新的服务端接口

如果 AI 工具在实现过程中发现这些内容很诱人，也不要顺手做。

本 PR 的原则是：小、稳、能跑、可接着长。

---

## 五、技术约束

### 5.1 Next.js 约束

项目当前使用：

- Next.js 16.2 App Router
- React 19
- `output: "export"` 静态导出

相关本地文档结论：

1. 交互式 UI、状态、事件、浏览器 API 应放在 Client Component 内。
2. 静态导出项目可以正常使用 Client Component。
3. 不要引入依赖服务端运行时才能成立的画布方案。

因此，Konva 编辑器必须是纯客户端能力。

### 5.2 项目约束

必须遵守：

- 所有新增源码使用 TypeScript
- 样式继续使用 Tailwind CSS 4
- 复用现有深色蓝调、玻璃质感风格
- 不引入新的状态管理库
- 不新增服务端路由、Server Action、Route Handler 作为前提
- 非必要不新增依赖

### 5.3 Konva 选型约束

推荐新增：

- `konva`
- `react-konva`

不建议在本 PR 再额外引入：

- 新状态库
- 富文本编辑库
- 复杂画布插件
- 额外图片处理 SDK

图片加载优先使用浏览器原生 `Image` 对象或已有能力，不强制再加 `use-image`。

---

## 六、推荐实现方向

### 6.1 总体策略

不要重做整个右侧。

正确做法是：

1. 保留 `WorkspacePanel` 整体布局
2. 保留 `WorkspaceHeader`
3. 保留 `WorkspaceJobTimeline`
4. 保留 `WorkspaceAssetRail`
5. 仅替换或升级 `WorkspacePrimaryCanvas`

### 6.2 产品形态

本 PR 不是“自由画布”，而是“单场景画板”。

可以把它理解成：

- 一个固定尺寸的画板
- 默认放入当前选中的图片
- 用户可对这张图做最基础变换
- 导出时得到新的扁平图片

### 6.3 为什么先做单场景

因为当前工作区的核心对象还是：

- 当前线程
- 当前选中资产
- 当前资产列表

它还没有成熟到需要多场景、多图层工程系统。

先做单场景，可以最大程度复用现有 `workspace.selectedAsset` 语义。

---

## 七、建议的数据模型

本 PR 建议新增一层最小画布文档模型。

推荐新增文件：

- `components/workspace/canvas/types.ts`
- `components/workspace/canvas/storage.ts`

推荐最小类型如下：

```ts
export type CanvasNodeType = "image";

export interface CanvasImageNode {
  id: string;
  type: "image";
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface WorkspaceCanvasDocument {
  id: string;
  threadId: string;
  width: number;
  height: number;
  background: string;
  selectedNodeId: string | null;
  nodes: CanvasImageNode[];
  updatedAt: number;
}
```

### 7.1 设计原则

- 文档只存 JSON，不直接存巨大的 base64 副本
- 节点通过 `assetId` 关联现有资产
- 当前 PR 只允许一个图片节点也可以，但结构要允许未来扩展为多个节点

### 7.2 持久化建议

当前 `useMediaStore` 是内存态。

因此本 PR 至少需要对 `WorkspaceCanvasDocument` 做 localStorage 持久化，否则刷新页面后画布会丢失。

建议使用新的 storage key，例如：

- `growpilot_ecom_canvas_v1`

按 `threadId` 存储当前线程对应的画布文档即可。

---

## 八、推荐文件改动范围

### 8.1 必改文件

- `components/workspace/WorkspacePrimaryCanvas.tsx`
- `components/workspace/WorkspacePanel.tsx`
- `components/workspace/types.ts`
- `hooks/useEcomChatSession.ts`

### 8.2 推荐新增文件

- `components/workspace/canvas/KonvaWorkspaceCanvas.tsx`
- `components/workspace/canvas/useWorkspaceCanvasDocument.ts`
- `components/workspace/canvas/storage.ts`
- `components/workspace/canvas/types.ts`

### 8.3 可能需要改动的文件

- `package.json`
- `components/workspace/useWorkspaceState.ts`
- `hooks/useMediaStore.ts`

### 8.4 职责分配建议

`WorkspacePrimaryCanvas.tsx`

- 继续作为右侧主区域容器
- 负责空态、loading 态、错误态、按钮区
- 不要把全部 Konva 逻辑都堆进这个文件

`KonvaWorkspaceCanvas.tsx`

- 负责 Stage / Layer / Transformer / 导出
- 负责节点选中与变换
- 负责画布视口尺寸计算

`useWorkspaceCanvasDocument.ts`

- 负责加载、初始化、更新、保存画布文档
- 对 UI 暴露最小操作接口

---

## 九、最小交互要求

本 PR 至少支持以下交互：

### 9.1 初始加载

当右侧存在 `selectedAsset`，且它是图片资产时：

- 自动生成或加载该线程的画布文档
- 若文档为空，则把当前图片作为默认节点放入画板中央

### 9.2 选中

- 点击图片节点后选中
- 空白区域点击后取消选中
- 选中后显示 `Transformer`

### 9.3 拖拽

- 图片节点可拖动
- 拖动结束后写回文档状态

### 9.4 缩放

- 通过 `Transformer` 支持缩放
- 最小尺寸要做限制，避免被缩到不可见

### 9.5 导出

- 提供“导出为新素材”按钮
- 导出为 PNG data URL
- 导出后写入当前线程的媒体列表
- 新导出的素材应自动进入现有右侧资产流

---

## 十、导出回流规则

导出后的结果不是替换原图，而是新增一条图片素材。

推荐行为：

1. 生成新的 `MediaItem`
2. `type` 为 `image`
3. `dataUrl` 为 `stage.toDataURL(...)` 结果
4. `prompt` 可使用类似：
   - `画布导出 - ${原资产 prompt}`
5. `status` 留空或标记为 `已导出`

然后通过现有 `mediaStore.addMedia(activeThreadId, [item])` 回流。

这样可以直接复用当前：

- `WorkspaceAssetRail`
- `WorkspaceJobTimeline`
- `加入项目`
- `发送回对话`

这比单独造一套“画布产物系统”更稳。

---

## 十一、UI 形态建议

### 11.1 视觉定位

继续沿用当前工作区风格：

- 深色背景
- 蓝色系高亮
- 玻璃质感
- 清晰层级

不要做成：

- 白底编辑器
- 通用后台工具面板
- 过度像 Figma / Canva 的通用设计器

### 11.2 布局建议

`WorkspacePrimaryCanvas` 内建议拆为三段：

1. 顶部说明栏
2. 中间 Konva 画板区
3. 底部动作区

推荐动作按钮：

- `重置画板`
- `适配画布`
- `导出为新素材`

如果空间有限，至少保留：

- `导出为新素材`

### 11.3 空态规则

当没有选中资产时：

- 显示现有空态或增强版空态
- 引导用户先生成或上传图片

当选中的是视频资产时：

- 不进入 Konva 画板
- 继续使用现有视频预览态
- 明确提示“当前画布仅支持图片素材”

---

## 十二、推荐实施步骤

按以下顺序执行，风险最低。

### 阶段 1：安装依赖

新增：

- `konva`
- `react-konva`

如果 Next dev 下出现与 `canvas` 包相关的问题，再做最小兼容处理。

但不要先过度修改构建配置。

### 阶段 2：抽离画布文档状态

先完成：

- `WorkspaceCanvasDocument` 类型
- localStorage 读写工具
- `useWorkspaceCanvasDocument`

这一步先不接 UI，也可以单独验证状态是否能写入和恢复。

### 阶段 3：引入最小 Konva 组件

实现：

- `Stage`
- `Layer`
- 单图片节点
- `Transformer`
- 选中、取消选中、拖拽、缩放

### 阶段 4：接入现有主区域

把 `WorkspacePrimaryCanvas` 改为：

- 图片资产时进入 Konva 画板
- 视频资产时保留现有视频预览
- loading / failed / empty 保留现有逻辑

### 阶段 5：接入导出回流

实现：

- 画布导出为 PNG
- 写回 `mediaStore`
- 自动选中新导出的结果

### 阶段 6：补充验证

重点验证：

- 切换线程
- 切换素材
- 刷新页面
- 上传图片后进入画布
- 导出后资产列表可见

---

## 十三、实现时的注意事项

### 13.1 不要让画布逻辑和聊天逻辑耦死

聊天仍然由：

- `hooks/useEcomChatSession.ts`

负责。

画布状态不要直接塞进聊天消息结构里。

### 13.2 不要把导出结果直接写入项目存储

导出结果应先作为当前线程中的普通素材，再由用户决定是否加入项目。

### 13.3 不要让视频进入 Konva

视频在本 PR 中只保留预览逻辑，不做画布编辑。

### 13.4 不要让画布强依赖当前选中态瞬时变化

当用户从素材条切换到另一张图片时：

- 可以重建文档
- 或更新当前文档中的主节点

但要避免因为 `selectedAsset` 变化导致 Stage 整体频繁抖动。

### 13.5 不要把 base64 大对象无限写入 localStorage

画布文档应尽量只存布局信息和 assetId。

导出的新图片作为 `MediaItem.dataUrl` 已经会占用空间，因此更要避免重复写入。

---

## 十四、验收标准

满足以下条件即可认为本 PR 完成：

1. `/dashboard/ecom-agent` 右侧主区域对图片资产会显示 Konva 画板。
2. 画板中的图片可以被选中、拖拽、缩放。
3. 可以导出为新图片素材。
4. 导出的素材会进入当前线程资产列表。
5. 切换线程后不会串画布状态。
6. 刷新页面后，当前线程的画布布局仍可恢复。
7. 视频资产仍然可预览，没有被本次改坏。
8. 空态、加载态、失败态没有被破坏。

---

## 十五、建议提交粒度

建议分成 2 到 3 个小提交，不要一个提交把所有内容混在一起。

推荐顺序：

1. `feat(workspace): add canvas document model and storage`
2. `feat(workspace): add minimal konva editor for image assets`
3. `feat(workspace): export canvas result back to asset rail`

如果只做一个 PR，也尽量按这个结构组织代码。

---

## 十六、给 AI 编码工具的直接执行指令

如果你是 GLM-5、Claude 或其他 AI 编码工具，请按下面顺序执行：

1. 先阅读以下文件，再开始改动：
   - `app/dashboard/ecom-agent/EcomAgentPageClient.tsx`
   - `components/workspace/WorkspacePanel.tsx`
   - `components/workspace/WorkspacePrimaryCanvas.tsx`
   - `components/workspace/useWorkspaceState.ts`
   - `hooks/useEcomChatSession.ts`
   - `hooks/useMediaStore.ts`
2. 安装 `konva` 与 `react-konva`
3. 新增最小画布文档类型与 localStorage 存储
4. 新增 Konva 画板组件
5. 将图片资产接入 Konva 主区域
6. 实现导出回流到现有资产列表
7. 手动验证 `/dashboard/ecom-agent`
8. 不要顺手扩展成完整设计器

---

## 十七、最终目标句

本 PR 完成后，电商智能体右侧应从“展示当前图片”升级为“允许用户基于当前图片做最小二次编辑并回流结果”的工作台骨架。

这就是这次最小 Konva 骨架 PR 的唯一目标。
