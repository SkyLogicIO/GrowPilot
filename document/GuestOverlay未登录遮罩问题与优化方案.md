# GuestOverlay 未登录遮罩 — 问题与优化方案

> 记录时间：2026-04-09
> 当前采用：方案 A

## 问题描述

### 问题一：Header 下拉菜单被遮罩遮挡

**现象**：未登录状态下，GuestOverlay 遮罩（z-30）覆盖内容区。Header（z-20）中的下拉菜单（如语言切换、用户菜单等）虽然自身 z-index 较高（z-50），但点击触发区域在遮罩下方，导致下拉无法正常弹出或被遮罩盖住。

**根因**：GuestOverlay 使用 `fixed` 定位仅覆盖内容区（left: sidebarW, top: headerH），z-index（z-30）高于 Header（z-20），Header 的交互区域被遮罩拦截。

### 问题二：Sidebar 点击无效

**现象**：未登录状态下，左侧菜单栏（z-30）可以响应点击并切换路由，但无论切换到哪个页面，GuestOverlay 始终覆盖在最上层，用户看到的内容不变，点击实际上是无效的。

**根因**：Sidebar 和 GuestOverlay 的 z-index 平级（都是 z-30），两者互不干扰，Sidebar 可以正常响应事件。但遮罩始终覆盖内容区，路由变化对用户不可见。

---

## 优化方案

### 方案 A：遮罩全屏覆盖（已采用）

**思路**：将 GuestOverlay 改为覆盖整个视口（inset-0），z-index 提到最高（z-50），Header 和 Sidebar 的交互自然被遮罩拦截，所有点击都触发登录弹窗。

**改动文件**：
- `components/GuestOverlay.tsx` — 改为 `fixed inset-0 z-50`，移除 `isSidebarOpen` prop
- `app/dashboard/layout.tsx` — GuestOverlay 移到 main 外部，移除 `isSidebarOpen` 传递

**优点**：改动最小，一个文件核心改动 + 一处 layout 调整
**缺点**：Header 和 Sidebar 完全被遮住，视觉上较重

---

### 方案 B：遮罩只覆盖内容区 + Header/Sidebar 拦截点击

**思路**：保持遮罩不动（仅覆盖内容区），但给 Header 和 Sidebar 在未登录时加 `pointer-events-none` 或点击拦截，让点击也触发登录。

**改动文件**：
- `app/dashboard/layout.tsx` — 传递 `authed` 状态给 Header 和 Sidebar
- `components/header/Header.tsx` — 未登录时禁止交互或点击触发登录
- `components/shell/DashboardSidebar.tsx` — 未登录时禁止交互或点击触发登录

**优点**：保留 Header 和 Sidebar 的视觉呈现，用户仍能看到完整界面结构
**缺点**：需要改三处文件，且需注意 pointer-events 与 hover 效果的冲突

---

### 方案 C：未登录时简化 Header，隐藏 Sidebar

**思路**：未登录时 Header 只保留 Logo 和登录按钮（去掉下拉、搜索等交互元素），Sidebar 直接隐藏不渲染。GuestOverlay 自动调整为全屏展示。

**改动文件**：
- `app/dashboard/layout.tsx` — 未登录时隐藏 Sidebar，传 `authed` 给 Header
- `components/header/Header.tsx` — 接收 `authed`，未登录时只渲染 Logo + 登录按钮
- `components/GuestOverlay.tsx` — 无需计算偏移，改为全屏

**优点**：最干净的方案，未登录用户看到的就是一个简洁的引导页，没有无效交互
**缺点**：改动最多，需要修改 Header 的条件渲染逻辑
