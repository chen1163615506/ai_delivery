import axios from 'axios';
import type { Project, GitRepo, Task, Conversation, DeliveryReport, ProjectAssignee, PendingRequirement } from '../types';

// 检测是否在生产环境（GitHub Pages）
const isProduction = import.meta.env.PROD && window.location.hostname.includes('github.io');
const API_BASE_URL = isProduction ? '' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Mock 数据
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'AI交付平台',
    description: '端到端AI需求交付平台',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'CodeLink',
    description: '智能代码助手平台',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Moma',
    description: '移动办公平台',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    projectId: '1',
    title: '实现用户认证功能',
    description: '需要实现用户登录、注册、密码重置等功能',
    status: 'completed',
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    projectId: '1',
    title: '添加支付功能',
    description: '集成支付宝和微信支付',
    status: 'pending_confirm',
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    projectId: '2',
    title: '优化代码补全算法',
    description: '提升代码补全的准确率和响应速度',
    status: 'completed',
    createdBy: 'user2',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    projectId: '3',
    title: '实现消息推送功能',
    description: '支持即时消息推送和离线消息',
    status: 'pending_confirm',
    createdBy: 'user3',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockPendingRequirements: PendingRequirement[] = [
  {
    id: '1',
    projectId: '1',
    title: '优化首页加载性能',
    description: '首页加载时间过长，需要优化图片加载和代码分割',
    priority: 'high',
    source: 'Keones',
    sourceUrl: 'https://example.com/req/1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    projectId: '1',
    title: '添加数据导出功能',
    description: '用户需要能够导出报表数据为 Excel 格式',
    priority: 'medium',
    source: '需求池',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    projectId: '2',
    title: '实现代码审查功能',
    description: '自动检测代码质量问题并给出改进建议',
    priority: 'high',
    source: 'Keones',
    sourceUrl: 'https://example.com/req/3',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: '4',
    projectId: '2',
    title: '支持多语言代码补全',
    description: '扩展支持 Python、Java、Go 等语言',
    priority: 'medium',
    source: '需求池',
    createdAt: new Date(Date.now() - 9000000).toISOString(),
  },
  {
    id: '5',
    projectId: '3',
    title: '添加视频会议功能',
    description: '支持多人视频会议和屏幕共享',
    priority: 'high',
    source: 'Keones',
    sourceUrl: 'https://example.com/req/5',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '6',
    projectId: '3',
    title: '优化移动端性能',
    description: '减少移动端的内存占用和电量消耗',
    priority: 'low',
    source: '需求池',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];


// Mock 会话数据 - 从原始后端恢复
const mockConversations: Record<string, Conversation[]> = {
  '1': [
    {
      id: 'conv-1',
      taskId: '1',
      role: 'user',
      content: '请实现用户登录功能，包括用户名密码登录和第三方登录（GitHub、Google）',
      createdAt: new Date('2024-01-15T10:00:00'),
      step: '需求提交',
    },
    {
      id: 'conv-2',
      taskId: '1',
      role: 'assistant',
      content: '收到需求，开始分析项目结构和技术方案...',
      structuredContent: {
        type: 'analysis',
        analysis: [
          { label: '项目', value: 'Moma管理后台系统', type: 'info' },
          { label: '涉及仓库', value: 'moma-frontend, moma-backend', type: 'info' },
          { label: '预计工作量', value: '4-6小时', type: 'warning' },
          { label: '风险评估', value: '中等', type: 'warning' },
        ],
      },
      createdAt: new Date('2024-01-15T10:01:00'),
      step: '需求分析',
    },
    {
      id: 'conv-3',
      taskId: '1',
      role: 'assistant',
      content: '基于项目知识库分析，需要修改以下Git仓库：',
      structuredContent: {
        type: 'tree',
        tree: [
          {
            key: 'moma-frontend',
            title: 'moma-frontend',
            icon: 'github',
            children: [
              { key: 'login-page', title: '创建登录页面组件', status: 'pending' },
              { key: 'auth-service', title: '添加认证服务API调用', status: 'pending' },
              { key: 'oauth-components', title: '实现第三方登录组件', status: 'pending' },
              { key: 'route-guard', title: '配置路由守卫', status: 'pending' },
            ],
          },
          {
            key: 'moma-backend',
            title: 'moma-backend',
            icon: 'github',
            children: [
              { key: 'auth-controller', title: '实现登录控制器', status: 'pending' },
              { key: 'jwt-middleware', title: '添加JWT中间件', status: 'pending' },
              { key: 'oauth-integration', title: '集成GitHub/Google OAuth', status: 'pending' },
              { key: 'user-model', title: '扩展用户模型', status: 'pending' },
            ],
          },
        ],
      },
      createdAt: new Date('2024-01-15T10:02:00'),
      step: 'Git仓库分析',
    },
    {
      id: 'conv-4',
      taskId: '1',
      role: 'assistant',
      content: '制定实施计划，以下是详细的任务清单（点击展开查看具体文件和代码）：',
      structuredContent: {
        type: 'todo',
        todos: [
          {
            id: 'todo-1',
            content: '前端：创建登录页面UI',
            status: 'completed',
            type: 'task',
            children: [
              {
                id: 'todo-1-repo',
                content: 'moma-frontend',
                status: 'completed',
                type: 'repo',
                children: [
                  {
                    id: 'todo-1-file-1',
                    content: 'src/pages/LoginPage.tsx',
                    status: 'completed',
                    type: 'file',
                    children: [
                      {
                        id: 'todo-1-code-1',
                        content: '登录页面组件代码',
                        status: 'completed',
                        type: 'code',
                        code: {
                          language: 'typescript',
                          content: `import React, { useState } from 'react';
import { Form, Input, Button, Divider } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined, GoogleOutlined } from '@ant-design/icons';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: any) => {
    setLoading(true);
    // 登录逻辑
  };

  return (
    <div className="login-container">
      <Form onFinish={handleLogin}>
        <Form.Item name="username" rules={[{ required: true }]}>
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          登录
        </Button>
        <Divider>或</Divider>
        <Button icon={<GithubOutlined />} block>GitHub登录</Button>
        <Button icon={<GoogleOutlined />} block>Google登录</Button>
      </Form>
    </div>
  );
};

export default LoginPage;`
                        }
                      }
                    ]
                  },
                  {
                    id: 'todo-1-file-2',
                    content: 'src/services/auth.ts',
                    status: 'completed',
                    type: 'file',
                    children: [
                      {
                        id: 'todo-1-code-2',
                        content: '认证API调用',
                        status: 'completed',
                        type: 'code',
                        code: {
                          language: 'typescript',
                          content: `export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  loginWithGithub: (code: string) =>
    api.post('/auth/github', { code }),
  loginWithGoogle: (token: string) =>
    api.post('/auth/google', { token }),
};`
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'todo-2',
            content: '后端：实现登录API接口',
            status: 'completed',
            type: 'task',
            children: [
              {
                id: 'todo-2-repo',
                content: 'moma-backend',
                status: 'completed',
                type: 'repo',
                children: [
                  {
                    id: 'todo-2-file-1',
                    content: 'src/controllers/auth.controller.ts',
                    status: 'completed',
                    type: 'file',
                    children: [
                      {
                        id: 'todo-2-code-1',
                        content: '登录控制器',
                        status: 'completed',
                        type: 'code',
                        code: {
                          language: 'typescript',
                          content: `import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  res.json({ token, user: { id: user.id, username: user.username } });
};`
                        }
                      }
                    ]
                  },
                  {
                    id: 'todo-2-file-2',
                    content: 'src/middleware/auth.middleware.ts',
                    status: 'completed',
                    type: 'file',
                    children: [
                      {
                        id: 'todo-2-code-2',
                        content: 'JWT认证中间件',
                        status: 'completed',
                        type: 'code',
                        code: {
                          language: 'typescript',
                          content: `import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token无效' });
  }
};`
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'todo-3',
            content: '数据库：扩展用户表结构',
            status: 'completed',
            type: 'task',
            children: [
              {
                id: 'todo-3-repo',
                content: 'moma-backend',
                status: 'completed',
                type: 'repo',
                children: [
                  {
                    id: 'todo-3-file-1',
                    content: 'migrations/add_oauth_fields.sql',
                    status: 'completed',
                    type: 'file',
                    children: [
                      {
                        id: 'todo-3-code-1',
                        content: 'DDL迁移脚本',
                        status: 'completed',
                        type: 'code',
                        code: {
                          language: 'sql',
                          content: `-- 添加第三方登录字段
ALTER TABLE users
ADD COLUMN github_id VARCHAR(255),
ADD COLUMN google_id VARCHAR(255),
ADD COLUMN avatar_url VARCHAR(500),
ADD COLUMN provider VARCHAR(50);

-- 创建索引
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_google_id ON users(google_id);`
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'todo-4',
            content: '测试：编写单元测试',
            status: 'completed',
            type: 'task'
          },
          {
            id: 'todo-5',
            content: '文档：更新API文档',
            status: 'completed',
            type: 'task'
          }
        ],
      },
      createdAt: new Date('2024-01-15T10:03:00'),
      step: '任务规划与执行',
    },
    {
      id: 'conv-5',
      taskId: '1',
      role: 'assistant',
      content: '✅ 所有任务已完成！正在生成交付报告...',
      createdAt: new Date('2024-01-15T11:25:00'),
      step: '任务完成',
    },
  ],
  '2': [
    {
      id: 'conv-5',
      taskId: '2',
      role: 'user',
      content: '代码编辑器在打开大文件时很卡，请优化性能',
      createdAt: new Date('2024-01-17T09:00:00'),
      step: '需求提交',
    },
    {
      id: 'conv-6',
      taskId: '2',
      role: 'assistant',
      content: '开始性能分析...',
      structuredContent: {
        type: 'analysis',
        analysis: [
          { label: '问题', value: '大文件加载卡顿', type: 'error' },
          { label: '影响范围', value: '代码编辑器模块', type: 'warning' },
          { label: '性能瓶颈', value: '文件一次性加载、语法高亮、无虚拟滚动', type: 'error' },
        ],
      },
      createdAt: new Date('2024-01-17T09:05:00'),
      step: '问题分析',
    },
    {
      id: 'conv-7',
      taskId: '2',
      role: 'assistant',
      content: '制定优化方案并开始实施...',
      structuredContent: {
        type: 'todo',
        todos: [
          {
            id: 'todo-10',
            content: '实现文件分块加载',
            status: 'completed',
            children: [
              {
                id: 'todo-10-1',
                content: 'editor-frontend',
                status: 'completed',
                type: 'repo',
                children: [
                  {
                    id: 'todo-10-file-1',
                    content: 'src/components/CodeEditor/FileLoader.tsx',
                    status: 'completed',
                    type: 'file',
                  }
                ]
              }
            ]
          },
          {
            id: 'todo-11',
            content: '优化语法高亮算法',
            status: 'completed',
            children: [
              {
                id: 'todo-11-1',
                content: 'editor-frontend',
                status: 'completed',
                type: 'repo',
                children: [
                  {
                    id: 'todo-11-file-1',
                    content: 'src/utils/syntax-highlighter.ts',
                    status: 'completed',
                    type: 'file',
                  }
                ]
              }
            ]
          },
          {
            id: 'todo-12',
            content: '添加虚拟滚动',
            status: 'completed',
            children: [
              {
                id: 'todo-12-1',
                content: 'editor-frontend',
                status: 'completed',
                type: 'repo',
                children: [
                  {
                    id: 'todo-12-file-1',
                    content: 'src/components/CodeEditor/VirtualScroll.tsx',
                    status: 'completed',
                    type: 'file',
                  }
                ]
              }
            ]
          },
          {
            id: 'todo-13',
            content: '性能测试和对比',
            status: 'completed'
          },
        ],
      },
      createdAt: new Date('2024-01-17T09:10:00'),
      step: '优化方案',
    },
    {
      id: 'conv-8',
      taskId: '2',
      role: 'assistant',
      content: '已完成文件分块加载功能的实现',
      structuredContent: {
        type: 'code',
        code: {
          language: 'typescript',
          fileName: 'src/components/CodeEditor/FileLoader.tsx',
          content: `import React, { useState, useEffect } from 'react';

const CHUNK_SIZE = 10000; // 每次加载10000行

export const FileLoader: React.FC<{ filePath: string }> = ({ filePath }) => {
  const [chunks, setChunks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChunk = async (offset: number) => {
    setLoading(true);
    const response = await fetch(\`/api/files/\${filePath}?offset=\${offset}&limit=\${CHUNK_SIZE}\`);
    const data = await response.text();
    setChunks(prev => [...prev, data]);
    setLoading(false);
  };

  return <div>{/* 渲染代码 */}</div>;
};`,
        },
      },
      createdAt: new Date('2024-01-17T09:30:00'),
      step: '实现分块加载',
    },
    {
      id: 'conv-9',
      taskId: '2',
      role: 'assistant',
      content: '已优化语法高亮算法，使用Web Worker处理',
      structuredContent: {
        type: 'code',
        code: {
          language: 'typescript',
          fileName: 'src/utils/syntax-highlighter.ts',
          content: `// 使用Web Worker进行语法高亮，避免阻塞主线程
const worker = new Worker('/workers/syntax-worker.js');

export const highlightCode = (code: string, language: string): Promise<string> => {
  return new Promise((resolve) => {
    worker.postMessage({ code, language });
    worker.onmessage = (e) => resolve(e.data);
  });
};`,
        },
      },
      createdAt: new Date('2024-01-17T10:00:00'),
      step: '优化语法高亮',
    },
    {
      id: 'conv-10',
      taskId: '2',
      role: 'assistant',
      content: '已添加虚拟滚动功能',
      structuredContent: {
        type: 'code',
        code: {
          language: 'typescript',
          fileName: 'src/components/CodeEditor/VirtualScroll.tsx',
          content: `import React from 'react';
import { FixedSizeList } from 'react-window';

export const VirtualScroll: React.FC<{ lines: string[] }> = ({ lines }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={lines.length}
      itemSize={20}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{lines[index]}</div>
      )}
    </FixedSizeList>
  );
};`,
        },
      },
      createdAt: new Date('2024-01-17T10:30:00'),
      step: '添加虚拟滚动',
    },
    {
      id: 'conv-11',
      taskId: '2',
      role: 'assistant',
      content: '性能测试完成，优化效果显著',
      structuredContent: {
        type: 'analysis',
        analysis: [
          { label: '优化前', value: '打开100MB文件耗时: 15s，内存占用: 800MB', type: 'error' },
          { label: '优化后', value: '打开100MB文件耗时: 2s，内存占用: 150MB', type: 'success' },
          { label: '性能提升', value: '加载速度提升7.5倍，内存占用降低81%', type: 'success' },
          { label: 'FPS', value: '从15fps提升至60fps', type: 'success' },
        ],
      },
      createdAt: new Date('2024-01-17T11:00:00'),
      step: '性能测试',
    },
    {
      id: 'conv-12',
      taskId: '2',
      role: 'assistant',
      content: '✅ 优化任务已全部完成，代码已提交并创建MR，等待Code Review',
      createdAt: new Date('2024-01-17T11:30:00'),
      step: '完成',
    },
  ],
  '3': [
    {
      id: 'conv-9',
      taskId: '3',
      role: 'user',
      content: '添加AI需求分析功能，基于用户输入的需求描述，自动分析需求并生成任务列表',
      createdAt: new Date('2024-01-18T10:00:00'),
      step: '需求提交',
    },
    {
      id: 'conv-10',
      taskId: '3',
      role: 'assistant',
      content: '收到需求，正在分析项目结构和技术方案...',
      structuredContent: {
        type: 'analysis',
        analysis: [
          { label: '项目', value: 'AI交付平台', type: 'info' },
          { label: '涉及仓库', value: 'platform-frontend, platform-backend', type: 'info' },
          { label: '预计工作量', value: '6-8小时', type: 'warning' },
          { label: '技术栈', value: 'React + TypeScript + OpenAI API', type: 'info' },
        ],
      },
      createdAt: new Date('2024-01-18T10:01:00'),
      step: '需求分析',
    },
    {
      id: 'conv-11',
      taskId: '3',
      role: 'assistant',
      content: '分析完成，需要修改以下Git仓库：',
      structuredContent: {
        type: 'tree',
        tree: [
          {
            key: 'platform-frontend',
            title: 'platform-frontend',
            icon: 'github',
            children: [
              { key: 'ai-analysis-page', title: '创建AI需求分析页面', status: 'in_progress' },
              { key: 'analysis-form', title: '实现需求输入表单', status: 'in_progress' },
              { key: 'result-display', title: '展示分析结果组件', status: 'pending' },
            ],
          },
          {
            key: 'platform-backend',
            title: 'platform-backend',
            icon: 'github',
            children: [
              { key: 'ai-service', title: '集成OpenAI API服务', status: 'pending' },
              { key: 'analysis-controller', title: '实现需求分析控制器', status: 'pending' },
              { key: 'prompt-templates', title: '设计AI提示词模板', status: 'pending' },
            ],
          },
        ],
      },
      createdAt: new Date('2024-01-18T10:05:00'),
      step: 'Git仓库分析',
    },
    {
      id: 'conv-12',
      taskId: '3',
      role: 'assistant',
      content: '正在实施开发任务...',
      structuredContent: {
        type: 'todo',
        todos: [
          { id: 'todo-14', content: '前端：创建AI需求分析页面', status: 'in_progress' },
          { id: 'todo-15', content: '前端：实现需求输入表单', status: 'in_progress' },
          { id: 'todo-16', content: '后端：集成OpenAI API服务', status: 'pending' },
          { id: 'todo-17', content: '后端：实现需求分析控制器', status: 'pending' },
          { id: 'todo-18', content: '设计AI提示词模板', status: 'pending' },
          { id: 'todo-19', content: '展示分析结果组件', status: 'pending' },
        ],
      },
      createdAt: new Date('2024-01-18T10:10:00'),
      step: '开发计划',
    },
    {
      id: 'conv-13',
      taskId: '3',
      role: 'assistant',
      content: '正在开发前端页面...',
      structuredContent: {
        type: 'progress',
        progress: {
          current: 2,
          total: 6,
          message: '正在实现需求输入表单组件',
        },
      },
      createdAt: new Date('2024-01-18T10:30:00'),
      step: '执行开发',
    },
  ],
};
// Mock 交付报告数据 - 按任务ID组织
const mockReports: Record<string, DeliveryReport> = {
  '1': {
    id: 'report-1',
    taskId: '1',
    taskTitle: '实现用户认证功能',
    requirementUrl: 'https://example.com/req/auth',
    requirementStatus: 'ai_completed',
    tokenConsumed: 125000,
    mergeRequests: [
      {
        id: 'mr-1',
        gitRepoName: 'ai-delivery-backend',
        gitRepoUrl: 'https://github.com/example/ai-delivery-backend',
        mrUrl: 'https://github.com/example/ai-delivery-backend/pull/123',
        status: 'merged',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    impactAnalysis: [
      {
        module: '用户认证模块',
        description: '新增用户注册、登录、密码重置功能',
        severity: 'medium',
        upstreamServices: [],
        downstreamServices: ['用户中心', '权限管理'],
      },
    ],
    codeChanges: [
      {
        id: 'change-1',
        gitRepoName: 'ai-delivery-backend',
        filePath: 'src/controllers/auth.controller.ts',
        changeType: 'added',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        content: `export class AuthController {
  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
    // 实现注册逻辑
    const user = await User.create({ username, email, password });
    return res.json({ success: true, data: user });
  }
  
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    // 实现登录逻辑
    const token = await authService.login(username, password);
    return res.json({ success: true, token });
  }
}`,
      },
    ],
    databaseChanges: [
      {
        id: 'db-1',
        changeType: 'DDL',
        description: '创建 users 表',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        sqlScript: `CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`,
      },
    ],
    configChanges: [
      {
        id: 'config-1',
        configType: 'file',
        configKey: 'JWT_SECRET',
        filePath: '.env',
        oldValue: '',
        newValue: 'your-secret-key-here',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  '2': {
    id: 'report-2',
    taskId: '2',
    taskTitle: '添加支付功能',
    requirementUrl: 'https://example.com/req/payment',
    requirementStatus: 'ai_completed',
    tokenConsumed: 89000,
    mergeRequests: [
      {
        id: 'mr-2',
        gitRepoName: 'ai-delivery-backend',
        gitRepoUrl: 'https://github.com/example/ai-delivery-backend',
        mrUrl: 'https://github.com/example/ai-delivery-backend/pull/124',
        status: 'open',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'mr-3',
        gitRepoName: 'ai-delivery-frontend',
        gitRepoUrl: 'https://github.com/example/ai-delivery-frontend',
        mrUrl: 'https://github.com/example/ai-delivery-frontend/pull/45',
        status: 'open',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    impactAnalysis: [
      {
        module: '支付模块',
        description: '集成支付宝和微信支付SDK,新增支付回调处理',
        severity: 'high',
        upstreamServices: ['支付宝开放平台', '微信支付平台'],
        downstreamServices: ['订单系统', '账户系统', '通知系统'],
      },
      {
        module: '订单模块',
        description: '增加支付状态字段和支付回调处理逻辑',
        severity: 'medium',
        upstreamServices: [],
        downstreamServices: ['库存系统', '物流系统'],
      },
    ],
    codeChanges: [
      {
        id: 'change-2',
        gitRepoName: 'ai-delivery-backend',
        filePath: 'src/services/payment.service.ts',
        changeType: 'added',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        content: `export class PaymentService {
  async createAlipayOrder(orderId: string, amount: number) {
    const alipayClient = new AlipayClient(config);
    const result = await alipayClient.createOrder({
      orderId,
      amount,
      subject: '商品购买',
      notifyUrl: '/api/payment/alipay/callback'
    });
    return result;
  }
  
  async createWechatOrder(orderId: string, amount: number) {
    const wechatClient = new WechatPayClient(config);
    const result = await wechatClient.createOrder({
      orderId,
      amount,
      description: '商品购买',
      notifyUrl: '/api/payment/wechat/callback'
    });
    return result;
  }
  
  async handleCallback(provider: string, data: any) {
    const order = await Order.findByPaymentId(data.orderId);
    order.status = 'paid';
    await order.save();
    return { success: true };
  }
}`,
      },
      {
        id: 'change-3',
        gitRepoName: 'ai-delivery-frontend',
        filePath: 'src/components/PaymentModal.tsx',
        changeType: 'added',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        content: `export const PaymentModal: React.FC<Props> = ({ orderId, amount }) => {
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  
  const handlePay = async () => {
    try {
      const result = await paymentApi.createOrder({
        orderId,
        amount,
        method: paymentMethod
      });
      window.location.href = result.payUrl;
    } catch (error) {
      message.error('创建支付订单失败');
    }
  };
  
  return (
    <Modal title="选择支付方式" visible={true}>
      <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
        <Radio value="alipay">支付宝</Radio>
        <Radio value="wechat">微信支付</Radio>
      </Radio.Group>
      <Button type="primary" onClick={handlePay}>确认支付</Button>
    </Modal>
  );
}`,
      },
    ],
    databaseChanges: [
      {
        id: 'db-2',
        changeType: 'DDL',
        description: '创建 payments 表',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        sqlScript: `CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(100),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);`,
      },
      {
        id: 'db-3',
        changeType: 'DDL',
        description: '修改 orders 表添加支付状态',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        sqlScript: `ALTER TABLE orders 
  ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid',
  ADD COLUMN payment_id BIGINT NULL,
  ADD FOREIGN KEY (payment_id) REFERENCES payments(id);`,
      },
    ],
    configChanges: [
      {
        id: 'config-2',
        configType: 'file',
        configKey: 'ALIPAY_APP_ID',
        filePath: '.env',
        oldValue: '',
        newValue: 'your-alipay-app-id',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'config-3',
        configType: 'file',
        configKey: 'ALIPAY_PRIVATE_KEY',
        filePath: '.env',
        oldValue: '',
        newValue: 'your-alipay-private-key',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'config-4',
        configType: 'file',
        configKey: 'WECHAT_APP_ID',
        filePath: '.env',
        oldValue: '',
        newValue: 'your-wechat-app-id',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'config-5',
        configType: 'file',
        configKey: 'WECHAT_MCH_ID',
        filePath: '.env',
        oldValue: '',
        newValue: 'your-wechat-mch-id',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  '3': {
    id: 'report-3',
    taskId: '3',
    taskTitle: '优化代码补全算法',
    requirementUrl: 'https://example.com/req/code-completion',
    requirementStatus: 'ai_completed',
    tokenConsumed: 156000,
    mergeRequests: [
      {
        id: 'mr-4',
        gitRepoName: 'codelink-ai-engine',
        gitRepoUrl: 'https://github.com/example/codelink-ai-engine',
        mrUrl: 'https://github.com/example/codelink-ai-engine/pull/89',
        status: 'merged',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    impactAnalysis: [
      {
        module: 'AI推理引擎',
        description: '优化模型推理速度,提升代码补全准确率',
        severity: 'high',
        upstreamServices: ['模型服务', 'GPU集群'],
        downstreamServices: ['编辑器插件', 'Web IDE'],
      },
      {
        module: '缓存系统',
        description: '新增智能缓存策略,减少重复推理',
        severity: 'medium',
        upstreamServices: [],
        downstreamServices: ['Redis集群'],
      },
    ],
    codeChanges: [
      {
        id: 'change-4',
        gitRepoName: 'codelink-ai-engine',
        filePath: 'src/inference/optimizer.py',
        changeType: 'modified',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        content: `class InferenceOptimizer:
    def __init__(self, model_path: str, cache_size: int = 10000):
        self.model = self.load_model(model_path)
        self.cache = LRUCache(cache_size)
        self.batch_processor = BatchProcessor(max_batch_size=32)
    
    async def complete_code(self, context: str, cursor_pos: int) -> List[Completion]:
        cache_key = self.get_cache_key(context, cursor_pos)
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        result = await self.batch_processor.process(
            context, cursor_pos, temperature=0.2, top_p=0.95
        )
        
        completions = self.post_process(result)
        self.cache[cache_key] = completions
        return completions`,
      },
      {
        id: 'change-5',
        gitRepoName: 'codelink-ai-engine',
        filePath: 'src/cache/smart_cache.py',
        changeType: 'added',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        content: `class SmartCache:
    def __init__(self, redis_client, ttl: int = 3600):
        self.redis = redis_client
        self.ttl = ttl
        self.hit_rate_tracker = HitRateTracker()
    
    def get_cache_key(self, context: str, cursor_pos: int) -> str:
        semantic_hash = self.compute_semantic_hash(context)
        return f"completion:{semantic_hash}:{cursor_pos}"
    
    async def get(self, key: str) -> Optional[Any]:
        result = await self.redis.get(key)
        if result:
            self.hit_rate_tracker.record_hit()
            return json.loads(result)
        self.hit_rate_tracker.record_miss()
        return None`,
      },
    ],
    databaseChanges: [
      {
        id: 'db-4',
        changeType: 'DDL',
        description: '创建代码补全统计表',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        sqlScript: `CREATE TABLE completion_stats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  language VARCHAR(50) NOT NULL,
  completion_count INT DEFAULT 0,
  acceptance_rate DECIMAL(5,2),
  avg_latency_ms INT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, date),
  INDEX idx_language (language)
);`,
      },
    ],
    configChanges: [
      {
        id: 'config-6',
        configType: 'file',
        configKey: 'MODEL_VERSION',
        filePath: '.env',
        oldValue: 'v2.1.0',
        newValue: 'v2.3.0',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'config-7',
        configType: 'file',
        configKey: 'CACHE_SIZE',
        filePath: '.env',
        oldValue: '5000',
        newValue: '10000',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'config-8',
        configType: 'file',
        configKey: 'BATCH_SIZE',
        filePath: '.env',
        oldValue: '16',
        newValue: '32',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
  },
};

// 在生产环境使用 Mock 数据适配器
if (isProduction) {
  // 使用自定义 adapter 直接返回 mock 数据,不发起真实请求
  const mockAdapter = (config: any) => {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        const url = config.url || '';
        let responseData;

        if (url.includes('/projects')) {
          responseData = { success: true, data: mockProjects };
        } else if (url.includes('/tasks/pending-requirements')) {
          responseData = { success: true, data: mockPendingRequirements };
        } else if (url.includes('/conversations')) {
          const taskId = url.split('/')[2];
          const conversations = mockConversations[taskId] || [];
          responseData = { success: true, data: conversations };
        } else if (url.includes('/report')) {
          const taskId = url.split('/')[2];
          const report = mockReports[taskId];
          responseData = report ? { success: true, data: report } : { success: false, message: 'Report not found' };
        } else if (url.includes('/tasks')) {
          responseData = { success: true, data: mockTasks };
        } else {
          responseData = { success: false, message: 'Not found' };
        }

        resolve({
          data: responseData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      }, 100);
    });
  };

  // 设置自定义 adapter
  api.defaults.adapter = mockAdapter as any;
}
// 项目相关API
export const projectApi = {
  getAll: () => api.get<{ success: boolean; data: Project[] }>('/projects'),
  getById: (id: string) => api.get<{ success: boolean; data: Project }>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<{ success: boolean; data: Project }>('/projects', data),
  update: (id: string, data: Partial<Project>) =>
    api.put<{ success: boolean; data: Project }>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),

  // Git仓库管理
  getRepos: (projectId: string) =>
    api.get<{ success: boolean; data: GitRepo[] }>(`/projects/${projectId}/repos`),
  addRepo: (projectId: string, data: Partial<GitRepo>) =>
    api.post<{ success: boolean; data: GitRepo }>(`/projects/${projectId}/repos`, data),
  deleteRepo: (projectId: string, repoId: string) =>
    api.delete(`/projects/${projectId}/repos/${repoId}`),

  // Git仓库知识管理
  generateRepoKnowledge: (projectId: string, repoId: string) =>
    api.post<{ success: boolean; message: string }>(`/projects/${projectId}/repos/${repoId}/knowledge/generate`),
  getRepoKnowledge: (projectId: string, repoId: string) =>
    api.get<{ success: boolean; data: { knowledge: string | null; knowledgeStatus: string; knowledgeGeneratedAt: Date | string | null } }>(`/projects/${projectId}/repos/${repoId}/knowledge`),

  // 人员管理
  getAssignees: (projectId: string) =>
    api.get<{ success: boolean; data: ProjectAssignee[] }>(`/projects/${projectId}/assignees`),
  addAssignee: (projectId: string, data: Partial<ProjectAssignee>) =>
    api.post<{ success: boolean; data: ProjectAssignee }>(`/projects/${projectId}/assignees`, data),
  deleteAssignee: (projectId: string, assigneeId: string) =>
    api.delete(`/projects/${projectId}/assignees/${assigneeId}`),
};

// 任务相关API
export const taskApi = {
  getAll: (params?: { projectId?: string; status?: string }) =>
    api.get<{ success: boolean; data: Task[] }>('/tasks', { params }),
  getById: (id: string) => api.get<{ success: boolean; data: Task }>(`/tasks/${id}`),
  create: (data: Partial<Task>) => api.post<{ success: boolean; data: Task }>('/tasks', data),
  update: (id: string, data: Partial<Task>) =>
    api.put<{ success: boolean; data: Task }>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  getConversations: (taskId: string) =>
    api.get<{ success: boolean; data: Conversation[] }>(`/tasks/${taskId}/conversations`),
  addConversation: (taskId: string, data: { role: string; content: string }) =>
    api.post<{ success: boolean; data: Conversation }>(`/tasks/${taskId}/conversations`, data),
  getReport: (taskId: string) =>
    api.get<{ success: boolean; data: DeliveryReport }>(`/tasks/${taskId}/report`),
  // 获取待下发任务
  getPendingRequirements: (params?: { projectId?: string }) =>
    api.get<{ success: boolean; data: PendingRequirement[] }>('/tasks/pending-requirements/list', { params }),
};

export default api;



