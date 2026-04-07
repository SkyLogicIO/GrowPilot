# GrowPilot v2 — 隐藏内容审计报告

> 生成时间：2026-04-07

---

## 一、侧边栏 `hidden: true`（菜单级隐藏）

**文件**：`components/shell/DashboardSidebar.tsx`

| 标签 | 路由 | 说明 |
|------|------|------|
| 我的项目 | `/dashboard/project` | 整个父菜单隐藏，含子菜单 |
| ├ AI 视频工场 | `/dashboard/video-factory` | 子项，随父菜单隐藏 |
| ├ AI 绘画工作室 | `/dashboard/art-studio` | 子项，随父菜单隐藏 |
| └ 数字人 | `/dashboard/project?create=avatar` | 子项，自身也 hidden |
| 资产 | `/dashboard/assets/hot` | 整个父菜单隐藏，含子菜单 |
| AI营销助手 | `/dashboard/marketing-assistant` | 顶级菜单隐藏 |

**共 4 个 hidden 项**，波及 8+ 条子路由。

---

## 二、侧边栏 `disabled: true`（功能未实现，灰色不可点击）

**文件**：`components/shell/DashboardSidebar.tsx`

### 商品图设计（1 父 + 10 子 = 11 项）

| 标签 | 路由 |
|------|------|
| 商品图设计 | `/dashboard/product-image` |
| ├ 卖点图设计 | `/dashboard/product-image/selling-point` |
| ├ 白底图设计 | `/dashboard/product-image/white-bg` |
| ├ 主图设计 | `/dashboard/product-image/main` |
| ├ 尺寸图设计 | `/dashboard/product-image/size` |
| ├ 细节图设计 | `/dashboard/product-image/detail` |
| ├ 场景渲染图 | `/dashboard/product-image/scene-render` |
| ├ 使用场景图 | `/dashboard/product-image/scene-use` |
| ├ 营销海报 | `/dashboard/product-image/poster` |
| ├ 场景替换 | `/dashboard/product-image/scene-swap` |
| └ 产品替换 | `/dashboard/product-image/product-swap` |

### 产品模特（1 父 + 6 子 = 7 项）

| 标签 | 路由 | 备注 |
|------|------|------|
| 产品模特 | `/dashboard/model` | |
| ├ AI 模特 | `/dashboard/model/ai-model` | HOT 标签 |
| ├ 姿势裂变 | `/dashboard/model/pose` | HOT 标签 |
| ├ 产品数字人 | `/dashboard/model/digital-human` | |
| ├ 角色替换 | `/dashboard/model/role-swap` | |
| ├ 产品替换 | `/dashboard/model/product-swap` | |
| └ 场景替换 | `/dashboard/model/scene-swap` | |

**共 18 个 disabled 项**，且对应的路由文件（`app/dashboard/product-image/`、`app/dashboard/model/`）均不存在。

---

## 三、工具页「即将上线」功能

**文件**：`app/dashboard/tools/ToolsPageClient.tsx`

点击后弹出 ComingSoon 弹窗，共计 **30+ 项**未实现工具：

### AI帮我写（4 项）

- 直播话术生成
- 带货脚本生成
- 短视频文案提取
- 爆款脚本仿写

### 图像处理（8 项，仅 1 项已实现）

- 通用图像编辑 — **已实现**（ImageEditModal）
- 高清放大
- 局部重绘
- 智能抠图
- AI消除
- 智能扩图
- 元素擦除
- 线稿提取

### AI图像工具（8 项，仅 1 项已实现）

- 万物迁移
- 换背景 — **已实现**（BackgroundReplaceModal）
- 换脸
- 换装
- 手部修复
- 肤质增强
- 人像调节
- 产品精修

### 视频分析（7 项，全部未实现）

- 声音提取
- ASR工具
- 背景替换
- 数字人
- 智能字幕
- 视频去水印
- 视频增强
- 镜头分割

---

## 四、未实现的代码逻辑

**文件**：`components/NewProjectModal.tsx` 第 361 行

```typescript
const handleAvatarGenerate = async (...) => {
  // TODO: Implement avatar generation logic
  alert("数字人生成功能即将上线，敬请期待！");
  throw new Error("Avatar generation not implemented yet");
};
```

数字人生成功能仅有占位代码，调用时弹出 alert 并抛错。

---

## 五、首页已移除的内容

**文件**：`app/dashboard/page.tsx`

| 移除项 | 原说明 |
|--------|--------|
| 4 张统计卡片 | 本周创作/资产容量/获得积分/算力消耗 |
| 最近项目网格 | 最多 8 个项目的缩略图网格 |

---

## 六、响应式隐藏（非内容隐藏，属于正常设计）

以下为移动端/小屏隐藏，属于响应式设计范畴：

- `HeaderSearch`：搜索栏 `hidden md:flex`
- `Header`：顶栏操作按钮 `hidden lg:flex`
- `EcomAgentPageClient`：右侧工作区 `hidden lg:flex`
- `HomePageClient`：副标题 `hidden sm:block`
- `MarketingAssistantPageClient`：信息标签 `hidden md:block`

---

## 汇总

| 类别 | 数量 | 说明 |
|------|------|------|
| 侧边栏 hidden 菜单 | 4 项 | 页面存在但导航不可见，URL 可直接访问 |
| 侧边栏 disabled 菜单 | 18 项 | 灰色不可点击，路由文件也不存在 |
| 工具页 Coming Soon | 30+ 项 | 弹窗提示即将上线 |
| 未实现代码逻辑 | 1 处 | 数字人生成 TODO |
| 首页已移除内容 | 2 块 | 统计卡片 + 最近项目 |
| 响应式隐藏 | 10+ 处 | 正常设计，无需处理 |
