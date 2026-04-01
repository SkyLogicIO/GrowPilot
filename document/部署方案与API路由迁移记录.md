# 部署方案与 API 路由迁移记录

> 最后更新：2026-03-30

---

## 一、问题背景

线上部署使用宝塔面板（Nginx 静态托管），`next.config.ts` 配置了 `output: "export"` 纯静态导出模式。

`output: "export"` 的特性：

- `next build` 只生成静态 HTML/CSS/JS 到 `out/` 目录
- **所有 API Routes（`app/api/*`）被完全排除**，不会被打包
- 线上没有 Node.js 服务处理 API 请求

结果：前端 POST 请求发到 `/api/proxy/text2img` → Nginx 找不到路径 → 返回 HTML 错误页 → 前端 `JSON.parse()` 报错：`Unexpected token '<', "<html>..."`

**为什么本地没问题？** `next dev` 开发服务器无视 `output` 配置，始终启动完整 Node.js 服务来处理 API Routes。

---

## 二、两种解决方案

### 方案 A：standalone 模式（Node.js 服务部署）

改动 `next.config.ts`：

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  // ...
};
```

特点：

| 维度 | 说明 |
|------|------|
| API Routes | 保留，正常工作 |
| 部署产物 | `.next/standalone/` 自包含 Node.js 服务 |
| 部署方式 | `node server.js`（需 Node.js 运行时 + Docker/PM2） |
| 部署复杂度 | 较高 |
| 代码改动量 | 3 行配置 |

Dockerfile 适配：

```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3003
CMD ["node", "server.js"]
```

### 方案 B：客户端直调 SDK（纯静态部署）

将 API 路由中的 Google GenAI SDK 调用逻辑移到前端组件中，客户端直调 Google API。

| 维度 | 说明 |
|------|------|
| API Routes | 删除（不再需要） |
| 部署产物 | `out/` 静态文件（Nginx 直接 serve） |
| 部署方式 | 纯静态，无需 Node.js 运行时 |
| 部署复杂度 | 低 |
| 代码改动量 | 新建 `lib/ai.ts` + 改 3 个组件 + 删除 API 路由 |

---

## 三、方案选型：当前选方案 B

选方案 B 的理由：

1. **营销助手已有先例** — 项目中 `MarketingAssistantPageClient.tsx` 已经是客户端直调 Gemini SDK，统一风格更一致
2. **API 路由无服务端独有逻辑** — 没有密钥保护、没有数据库、没有权限校验，纯粹是转发 SDK 调用，搬到客户端完全等价
3. **部署更简单** — 不需要 Docker、不需要 Node.js 运行时，nginx 直接 serve
4. **API Key 安全性可接受** — Key 存在用户自己浏览器的 localStorage 里，每个用户配自己的 Key，不涉及泄露给第三方
5. **当前部署环境限制** — 宝塔面板静态托管是硬性要求

### 后续切换计划

当 ComfyUI GPU 服务器部署后，需要切回方案 A（standalone）：

- ComfyUI 调用**必须走服务端代理**（GPU 服务器不应暴露给浏览器）
- 届时新建 `/api/proxy/comfyui/*` 路由，在服务端转发到 ComfyUI
- `next.config.ts` 改回 `output: "standalone"`
- 已有的客户端直调（Imagen/Veo/Gemini Image）可保留，也可选择性迁回服务端

---

## 四、方案 B 实施详情

### 迁移映射

| 原调用方式 | 新调用方式 | 涉及文件 |
|-----------|-----------|---------|
| `POST /api/proxy/text2img`（文生图） | `lib/ai.ts` → `generateImage()` | `ArtStudioPageClient.tsx` |
| `POST /api/proxy/text2img`（图片编辑） | `lib/ai.ts` → `editImage()` | `BackgroundReplaceModal.tsx` |
| `POST /api/proxy/text2video` | `lib/ai.ts` → `generateVideo()` | `VideoFactoryPageClient.tsx` |
| `POST /api/proxy/imageedit` | 已失效，改为 ComingSoon | `ImageEditModal.tsx` |
| `POST /api/proxy/faceswap` | 已失效，改为 ComingSoon | `FaceSwapModal.tsx` |

### 删除的文件

- `app/api/proxy/text2img/route.ts`
- `app/api/proxy/text2video/route.ts`
- `app/api/proxy/imageedit/route.ts`
- `app/api/proxy/faceswap/route.ts`

### 新建的文件

- `lib/ai.ts` — 客户端 AI 服务层，封装 `generateImage`、`editImage`、`generateVideo` 三个函数

### 工具箱联动

`ImageEditModal` 和 `FaceSwapModal` 对应的"通用图像编辑"和"换脸"工具，因后端不可用，在工具箱中改为 ComingSoon 占位。
