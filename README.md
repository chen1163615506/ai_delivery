# AI需求交付平台

端到端AI需求交付平台，解决企业级复杂需求。

🔗 **在线演示**: https://chen1163615506.github.io/ai_delivery

## 技术栈

- **前端**: React 18 + TypeScript + Ant Design + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL + Prisma ORM

## 核心功能

### 1. 我的资产
- 项目管理（Git配置、权限管理）
- 知识库生成（Deepwiki/Claude.md）
- Keones四层级配置
- 测试环境配置

### 2. 首页（需求下发）
- 项目选择
- 需求输入与会话
- 历史需求查看

### 3. 详情页
- 实时会话过程
- 交付报告生成
  - 交付概要（需求名称、Git、MR链接、Token消耗）
  - 变更说明（影响面、代码变更、数据库变更、配置变更）

## 快速开始

### 方式一：使用启动脚本（推荐）
```bash
./start.sh
```

### 方式二：手动启动

1. 安装依赖
```bash
npm run install:all
```

2. 启动开发环境
```bash
npm run dev
```

### 访问应用
- 前端地址: http://localhost:5173
- 后端地址: http://localhost:3001
- 健康检查: http://localhost:3001/health

### 构建生产版本
```bash
npm run build
```

## 项目结构

```
ai-delivery-platform/
├── client/                    # 前端应用 (React + TypeScript)
│   ├── src/
│   │   ├── components/       # 公共组件
│   │   ├── layouts/          # 布局组件
│   │   │   └── MainLayout.tsx
│   │   ├── pages/            # 页面组件
│   │   │   ├── HomePage.tsx         # 首页（需求下发）
│   │   │   ├── AssetsPage.tsx       # 我的资产
│   │   │   └── TaskDetailPage.tsx   # 任务详情
│   │   ├── services/         # API服务
│   │   │   └── api.ts
│   │   ├── types/            # TypeScript类型定义
│   │   └── App.tsx           # 应用入口
│   └── package.json
├── server/                   # 后端应用 (Node.js + Express)
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   │   ├── project.controller.ts
│   │   │   └── task.controller.ts
│   │   ├── routes/          # 路由
│   │   │   ├── project.routes.ts
│   │   │   └── task.routes.ts
│   │   ├── types/           # TypeScript类型定义
│   │   └── index.ts         # 应用入口
│   ├── prisma/
│   │   └── schema.prisma    # 数据库模型定义
│   ├── .env                 # 环境变量（需自行配置）
│   └── package.json
├── start.sh                 # 启动脚本
├── package.json             # 根配置
└── README.md

```

## 使用指南

### 1. 我的资产页面
- 管理项目：创建、编辑、删除项目
- 配置Git仓库：为每个项目添加Git仓库信息
- 设置负责人和权限

### 2. 首页（需求下发）
- 选择目标项目
- 输入需求描述
- 提交后自动创建任务并跳转到详情页
- 查看历史需求（按项目分组）

### 3. 任务详情页
- 实时对话：与AI进行需求沟通
- 查看进度：任务状态实时更新
- 查看报告：任务完成后生成交付报告
  - 交付概要：需求信息、MR链接、Token消耗
  - 变更说明：代码变更、数据库变更、配置变更

## 当前版本说明

这是 **MVP版本**，包含以下特性：

✅ 已实现：
- 完整的前端UI（简约风格）
- 左侧可收起侧边栏
- 项目管理功能
- 需求下发和会话界面
- 任务详情和交付报告展示
- Mock数据支持（无需数据库即可运行）

🔄 待完善（未来版本）：
- 真实的数据库集成（Prisma + PostgreSQL）
- AI模型集成（需求理解和代码生成）
- Git集成（自动创建MR）
- Keones集成（需求追踪）
- 知识库生成
- 测试环境部署

