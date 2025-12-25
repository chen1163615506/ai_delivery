// 空间类型
export type SpaceType = 'personal' | 'project';

// 空间（替代原来的Project）
export interface Space {
  id: string;
  name: string;
  type: SpaceType; // 个人空间 | 项目空间
  description?: string;
  testEnv?: string; // 测试环境
  domain?: string; // 域名
  keyones?: string; // KeyOnes四层级（用/分隔，例如：技术效能中心/效能架构部/CodeLink/IDECodeLink）
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 空间成员（替代原来的ProjectAssignee）
export interface SpaceMember {
  id: string;
  spaceId: string;
  userName: string;
  userEmail?: string;
  position?: string;
  role: 'owner' | 'admin' | 'member'; // 所有者 | 管理员 | 成员
  createdAt: Date | string;
}

export interface GitRepo {
  id: string;
  spaceId: string; // 关联的空间ID（原projectId）
  name: string;
  url: string;
  description?: string;
  owner?: string; // 负责人
  reviewer?: string; // CR人
  knowledge?: string; // Git仓库知识
  knowledgeStatus?: 'not_generated' | 'generating' | 'generated' | 'failed';
  knowledgeGeneratedAt?: Date | string;
}

export interface Task {
  id: string;
  spaceId: string; // 关联的空间ID（原projectId）
  title: string;
  description: string;
  status: 'in_progress' | 'pending_confirm' | 'completed'; // 进行中 | 待确认 | 已完成
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt?: Date | string | null;
  gitRepos?: TaskGitRepo[]; // 关联的git仓库和分支
}

// 任务关联的Git仓库配置
export interface TaskGitRepo {
  id: string;
  gitRepoId: string; // 关联的GitRepo ID
  gitRepoName: string; // 仓库名称
  baseBranch: string; // 基准分支
}

// 人员分配状态
export interface AssigneeStatus {
  userId: string;
  userName: string;
  status: 'pending' | 'dispatched'; // 待下发 | 已下发
  taskId?: string; // 下发后创建的任务ID
  dispatchedAt?: Date | string; // 下发时间
}

// 待下发任务(从需求平台拉取的任务)
export interface PendingRequirement {
  id: string;
  spaceId: string; // 关联的空间ID（原projectId）
  title: string;
  description: string;
  source: string; // 来源平台：Jira、Tapd等
  sourceUrl?: string; // 需求链接
  priority: 'low' | 'medium' | 'high'; // 优先级
  createdBy: string; // 创建人
  createdAt: Date | string;
  imageUrl?: string; // 图片
  documentUrl?: string; // 文档链接
  assignees: AssigneeStatus[]; // 分配的人员列表及状态
}

// 会话内容类型
export type ConversationContentType = 'text' | 'tree' | 'todo' | 'code' | 'progress' | 'analysis';

// 树状图节点
export interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
  icon?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

// TODO项（支持多层级）
export interface TodoItem {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  activeForm?: string;
  children?: TodoItem[]; // 支持子节点（仓库、文件、代码等）
  type?: 'task' | 'repo' | 'file' | 'code'; // 节点类型
  code?: {
    language: string;
    content: string;
  };
}

// 分析项
export interface AnalysisItem {
  label: string;
  value: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

// 会话内容数据
export interface ConversationContent {
  type: ConversationContentType;
  text?: string; // 文本内容
  tree?: TreeNode[]; // 树状图数据
  todos?: TodoItem[]; // TODO列表
  code?: {
    language: string;
    content: string;
    fileName?: string;
  }; // 代码块
  progress?: {
    current: number;
    total: number;
    message: string;
  }; // 进度
  analysis?: AnalysisItem[]; // 分析数据
}

export interface Conversation {
  id: string;
  taskId: string;
  role: 'user' | 'assistant' | 'system';
  content: string; // 纯文本内容（向后兼容）
  structuredContent?: ConversationContent; // 结构化内容
  createdAt: Date | string;
  step?: string; // 步骤名称，用于目录导航
}

export interface MergeRequest {
  id: string;
  gitRepoName: string;
  gitRepoUrl?: string; // Git仓库链接
  mrUrl: string;
  status: string; // open, merged, closed, pending_cr
  createdAt: Date | string;
}

export interface CodeChange {
  id: string;
  gitRepoName: string;
  filePath: string;
  changeType: string; // added, modified, deleted
  content?: string;
  createdAt: Date | string;
}

export interface DatabaseChange {
  id: string;
  changeType: string; // DDL, DML
  sqlScript: string;
  description?: string;
  createdAt: Date | string;
}

export interface ConfigChange {
  id: string;
  configType: string; // file, platform
  configKey: string;
  oldValue?: string;
  newValue: string;
  filePath?: string; // 配置文件路径
  platform?: string; // 配置平台名称
  createdAt: Date | string;
}

export interface ImpactAnalysis {
  module: string; // 业务模块名称
  description: string; // 影响描述
  severity: 'low' | 'medium' | 'high'; // 影响程度
  upstreamServices?: string[]; // 上游依赖服务
  downstreamServices?: string[]; // 下游依赖服务
}

export interface DeliveryReport {
  id: string;
  taskId: string;
  taskTitle: string; // 需求名称
  requirementStatus: 'completed' | 'ai_completed' | 'ai_in_progress'; // 需求状态：completed-已完成（已合并），ai_completed-AI完成（待确认），ai_in_progress-AI进行中
  tokenConsumed?: number;
  requirementUrl?: string; // 需求链接
  impactAnalysis: ImpactAnalysis[]; // 变更影响面分析
  createdAt: Date | string;
  updatedAt: Date | string;
  mergeRequests: MergeRequest[];
  codeChanges: CodeChange[];
  databaseChanges: DatabaseChange[];
  configChanges: ConfigChange[];
}

// Git仓库（空间知识）
export interface GitRepository {
  id: string;
  spaceId: string;
  name: string;
  url: string;
  defaultBranch: string;
  credentials?: {
    type: 'token' | 'ssh';
    token?: string;
    sshKey?: string;
  };
  status: 'connected' | 'disconnected' | 'error';
  lastTestAt?: Date | string;
  knowledgeStatus?: 'not_generated' | 'generating' | 'generated' | 'failed';
  knowledgeGeneratedAt?: Date | string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 知识库
export interface Knowledge {
  id: string;
  spaceId: string;
  title: string;
  category: 'business' | 'technical';
  subCategory?: 'api' | 'code-style' | 'architecture' | 'tech-stack' | 'other';
  content: string;
  appliedRepos: 'all' | string[];
  tags: string[];
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  aiUsageCount: number;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  version: number;
}

// Agent操作手册步骤
export interface ManualStep {
  order: number;
  name: string;
  description: string;
  executionType: 'command' | 'file_operation' | 'manual_check';
  command?: string;
  fileOperation?: {
    action: 'create' | 'update' | 'delete';
    path: string;
    content?: string;
  };
  expectedResult?: string;
  errorHandling?: string;
  isRequired: boolean;
  needsConfirmation: boolean;
}

// Agent操作手册
export interface AgentManual {
  id: string;
  spaceId: string;
  name: string;
  description: string;
  scenario: string;
  appliedRepos: 'all' | string[];
  category: 'deployment' | 'configuration' | 'testing' | 'database' | 'ci_cd' | 'other';
  steps: ManualStep[];
  isPublic: boolean;
  publicId?: string;
  usageCount: number;
  rating?: number;
  ratingCount?: number;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

