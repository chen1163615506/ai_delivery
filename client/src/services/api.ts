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
    status: 'in_progress',
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    projectId: '2',
    title: '优化代码补全算法',
    description: '提升代码补全的准确率和响应速度',
    status: 'in_progress',
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

// Mock 会话数据 - 按任务ID组织
const mockConversations: Record<string, Conversation[]> = {
  '1': [
    {
      id: 'conv-1',
      taskId: '1',
      role: 'assistant',
      content: '开始分析需求：实现用户认证功能',
      step: '需求分析',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'conv-2',
      taskId: '1',
      role: 'assistant',
      content: '正在设计数据库表结构...',
      step: '数据库设计',
      createdAt: new Date(Date.now() - 86000000).toISOString(),
    },
    {
      id: 'conv-3',
      taskId: '1',
      role: 'assistant',
      content: '实现用户注册和登录接口',
      step: '代码实现',
      createdAt: new Date(Date.now() - 85000000).toISOString(),
    },
  ],
  '2': [
    {
      id: 'conv-4',
      taskId: '2',
      role: 'assistant',
      content: '开始分析支付功能需求',
      step: '需求分析',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'conv-5',
      taskId: '2',
      role: 'assistant',
      content: '正在集成支付宝 SDK...',
      step: '代码实现',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
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
};

// 添加响应拦截器，在生产环境返回 Mock 数据
// 始终使用 Mock 数据拦截器
if (true) {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // 如果是网络错误或超时，返回 Mock 数据
      // 捕获所有错误并返回 Mock 数据
if (true) {
        const url = error.config.url;

        if (url?.includes('/projects')) {
          return Promise.resolve({
            data: { success: true, data: mockProjects },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }

        if (url?.includes('/tasks/pending-requirements')) {
          return Promise.resolve({
            data: { success: true, data: mockPendingRequirements },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }

        if (url?.includes('/tasks') && !url.includes('/conversations') && !url.includes('/report')) {
          return Promise.resolve({
            data: { success: true, data: mockTasks },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }

        if (url?.includes('/conversations')) {
          const taskId = url.split('/')[2];
          const conversations = mockConversations[taskId] || [];
          return Promise.resolve({
            data: { success: true, data: conversations },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }

        if (url?.includes('/report')) {
          const taskId = url.split('/')[2];
          const report = mockReports[taskId];
          if (report) {
            return Promise.resolve({
              data: { success: true, data: report },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: error.config,
            });
          }
        }
      }

      return Promise.reject(error);
    }
  );
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



