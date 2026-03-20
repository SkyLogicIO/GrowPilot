# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in
`node_modules/next/dist/docs/`. Your training data is outdated
-- the docs are the source of truth.

## Project: GrowPilot

- 面向营销创作者的 AI 内容创作平台
- 技术栈：Next.js 16.2 + React 19 + Tailwind 4 + Turbopack
- 包管理：pnpm（非 npm/yarn）
- 语言：所有文件统一使用 TypeScript（.tsx/.ts）
- 样式：Tailwind CSS 4 utility classes，深色主题
- AI 服务：Google GenAI（@google/genai）—— Veo 3.1（视频）、Imagen 4.0（图片）
- 外部代理：faceswap/imageedit 转发到 175.27.193.51:3008

## Design Direction

本项目需要建立独特的设计语言，避免千篇一律的"AI 工具"审美。
UI 开发时必须参考 .agents/skills/frontend-design/ 中的设计指引。
后续将确定具体的字体、配色、动效方案，届时更新此处。
