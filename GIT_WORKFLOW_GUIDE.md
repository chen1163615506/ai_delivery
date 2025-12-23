# Git仓库和分支关联功能说明

## 功能概述

在新建任务时,用户可以通过@git选择项目维护的git仓库,并为每个仓库指定基准分支。这样在AI会话流程中就不需要再判断影响哪些git了,直接使用任务中预先配置的git仓库和分支信息。

## 前端实现

### 1. 数据结构

#### TaskGitRepo 接口
```typescript
export interface TaskGitRepo {
  id: string;
  gitRepoId: string; // 关联的GitRepo ID
  gitRepoName: string; // 仓库名称
  baseBranch: string; // 基准分支
}
```

#### Task 接口扩展
```typescript
export interface Task {
  // ... 原有字段
  gitRepos?: TaskGitRepo[]; // 关联的git仓库和分支
}
```

### 2. 用户交互流程

1. **选择项目**: 用户首先选择一个项目
2. **@git选择仓库**: 在需求描述输入框中输入`@git`,会弹出该项目维护的所有git仓库列表
3. **选择分支**: 点击选择某个仓库后,弹出Modal让用户输入基准分支名称(如: main, master, develop)
4. **展示已选择**: 已选择的git仓库和分支会以Tag形式展示在输入框上方,用户可以删除
5. **提交任务**: 提交时会将选择的git仓库和分支信息一起保存到任务中

### 3. 关键文件

- `client/src/types/index.ts`: 定义TaskGitRepo和Task接口
- `client/src/pages/HomePage.tsx`: 实现@git选择和分支配置功能
- `client/src/services/api.ts`: API接口和Mock数据

## 后端实现要点

### 1. 数据库表设计

建议新增 `task_git_repos` 表:

```sql
CREATE TABLE task_git_repos (
  id VARCHAR(50) PRIMARY KEY,
  task_id VARCHAR(50) NOT NULL,
  git_repo_id VARCHAR(50) NOT NULL,
  git_repo_name VARCHAR(200) NOT NULL,
  base_branch VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (git_repo_id) REFERENCES git_repos(id),
  INDEX idx_task_id (task_id)
);
```

### 2. API接口修改

#### POST /api/tasks
请求体需要支持 `gitRepos` 字段:

```json
{
  "projectId": "1",
  "title": "实现用户登录功能",
  "description": "...",
  "createdBy": "user1",
  "gitRepos": [
    {
      "gitRepoId": "repo-1",
      "gitRepoName": "backend-service",
      "baseBranch": "main"
    },
    {
      "gitRepoId": "repo-2",
      "gitRepoName": "frontend-app",
      "baseBranch": "develop"
    }
  ]
}
```

#### GET /api/tasks/:id
响应需要包含 `gitRepos` 字段:

```json
{
  "success": true,
  "data": {
    "id": "1",
    "projectId": "1",
    "title": "实现用户登录功能",
    // ... 其他字段
    "gitRepos": [
      {
        "id": "1-1",
        "gitRepoId": "repo-1",
        "gitRepoName": "backend-service",
        "baseBranch": "main"
      }
    ]
  }
}
```

### 3. AI会话流程中使用git信息

在AI会话处理逻辑中,可以直接从任务对象中获取git仓库和分支信息:

```typescript
// 伪代码示例
async function processTask(taskId: string) {
  // 1. 获取任务信息
  const task = await getTaskById(taskId);

  // 2. 直接使用任务中配置的git信息,不需要再分析和判断
  if (task.gitRepos && task.gitRepos.length > 0) {
    for (const gitRepo of task.gitRepos) {
      console.log(`处理仓库: ${gitRepo.gitRepoName}`);
      console.log(`基准分支: ${gitRepo.baseBranch}`);

      // 3. 执行git操作
      await checkoutBranch(gitRepo.gitRepoName, gitRepo.baseBranch);
      await createFeatureBranch(gitRepo.gitRepoName, `feature/task-${taskId}`);

      // 4. 进行代码修改和提交
      // ...
    }
  } else {
    // 兼容旧任务:如果没有配置git信息,则使用原有的分析逻辑
    const affectedRepos = await analyzeAffectedRepos(task.description);
    // ...
  }
}
```

### 4. 优势

1. **明确性**: 用户在创建任务时就明确了需要修改哪些仓库,避免AI误判
2. **效率**: 跳过了"分析影响哪些仓库"的步骤,直接开始代码实现
3. **可控性**: 用户可以精确控制基准分支,支持多分支开发场景
4. **兼容性**: 对于旧任务或未配置git的任务,仍可使用原有分析逻辑

### 5. 会话流程优化

原有流程:
```
需求提交 → 需求分析 → Git仓库分析(判断影响哪些仓库) → 制定实施计划 → 执行开发
```

新流程(配置了git的任务):
```
需求提交(已选择git和分支) → 需求分析 → 制定实施计划 → 执行开发
```

直接跳过"Git仓库分析"步骤,提升效率。

## 前端Mock数据示例

```typescript
const mockTasks: Task[] = [
  {
    id: '1',
    projectId: '1',
    title: '实现用户认证功能',
    description: '需要实现用户登录、注册、密码重置等功能',
    status: 'completed',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    gitRepos: [
      {
        id: '1-1',
        gitRepoId: 'repo-1',
        gitRepoName: 'ai-delivery-backend',
        baseBranch: 'main'
      },
      {
        id: '1-2',
        gitRepoId: 'repo-2',
        gitRepoName: 'ai-delivery-frontend',
        baseBranch: 'main'
      },
    ],
  },
];
```

## 注意事项

1. **必填校验**: gitRepos可以为空(兼容旧数据),但如果提供了gitRepos数组,每个元素的gitRepoId、gitRepoName、baseBranch都必须有值
2. **去重**: 前端已实现了同一仓库不能重复添加的校验
3. **分支验证**: 建议后端在保存时验证分支名称的格式是否合法
4. **权限控制**: 确保用户只能选择其有权限访问的git仓库

## 测试建议

1. 创建任务时不选择任何git仓库(测试兼容性)
2. 创建任务时选择1个git仓库
3. 创建任务时选择多个git仓库
4. 尝试重复添加同一个仓库(应该被阻止)
5. 查看任务详情时能否正确显示关联的git信息
