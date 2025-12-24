import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Input,
  Button,
  Select,
  List,
  Tag,
  Empty,
  message,
  Space,
  Typography,
  Card,
  Checkbox,
} from 'antd';
import { SendOutlined, PlusOutlined, LinkOutlined, ClockCircleOutlined, GithubOutlined, BranchesOutlined, CloseOutlined } from '@ant-design/icons';
import { projectApi, taskApi } from '../services/api';
import type { Project, Task, PendingRequirement, GitRepo, TaskGitRepo } from '../types';

const { Title, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingRequirements, setPendingRequirements] = useState<PendingRequirement[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>();
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [requirementsLoading, setRequirementsLoading] = useState(false);

  // Git相关状态
  const [gitRepos, setGitRepos] = useState<GitRepo[]>([]);
  const [selectedGitRepos, setSelectedGitRepos] = useState<TaskGitRepo[]>([]);
  const [tempSelectedGitIds, setTempSelectedGitIds] = useState<string[]>([]); // 临时选中的git id
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    loadProjects();
    loadTasks();
    loadPendingRequirements();
  }, []);

  useEffect(() => {
    // 当选择项目后，重新加载该项目的待下发任务和Git仓库
    if (selectedProject) {
      loadPendingRequirements(selectedProject);
      loadGitRepos(selectedProject);
    } else {
      loadPendingRequirements();
      setGitRepos([]);
    }
    // 清空已选择的Git仓库
    setSelectedGitRepos([]);
  }, [selectedProject]);


  const loadProjects = async () => {
    try {
      const response = await projectApi.getAll();
      setProjects(response.data.data);
    } catch (error) {
      message.error('加载项目列表失败');
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskApi.getAll();
      setTasks(response.data.data);
    } catch (error) {
      message.error('加载任务列表失败');
    }
  };

  const loadPendingRequirements = async (projectId?: string) => {
    try {
      setRequirementsLoading(true);
      const params = projectId ? { projectId } : undefined;
      const response = await taskApi.getPendingRequirements(params);
      setPendingRequirements(response.data.data);
    } catch (error) {
      message.error('加载待下发任务失败');
    } finally {
      setRequirementsLoading(false);
    }
  };

  const loadGitRepos = async (projectId: string) => {
    try {
      const response = await projectApi.getRepos(projectId);
      setGitRepos(response.data.data);
    } catch (error) {
      console.error('Failed to load git repos:', error);
      message.error('加载Git仓库失败');
    }
  };

  // 处理输入框变化，检测@符号
  const handleRequirementChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRequirement(value);

    // 检测是否输入了@且项目已选择
    if (value.endsWith('@') && selectedProject && gitRepos.length > 0) {
      setDropdownOpen(true);
    }
  };

  // 确认添加选中的git仓库
  const handleConfirmGitSelection = () => {
    if (tempSelectedGitIds.length === 0) {
      message.warning('请至少选择一个Git仓库');
      return;
    }

    const newRepos: TaskGitRepo[] = [];
    tempSelectedGitIds.forEach(gitId => {
      // 检查是否已经添加过
      if (selectedGitRepos.find(r => r.gitRepoId === gitId)) {
        return;
      }
      const repo = gitRepos.find(r => r.id === gitId);
      if (repo) {
        newRepos.push({
          id: `temp-${Date.now()}-${gitId}`,
          gitRepoId: repo.id,
          gitRepoName: repo.name,
          baseBranch: '',
        });
      }
    });

    if (newRepos.length > 0) {
      setSelectedGitRepos([...selectedGitRepos, ...newRepos]);
      message.success(`已添加 ${newRepos.length} 个Git仓库`);
    }

    // 移除输入框中的@
    setRequirement(requirement.slice(0, -1));

    // 重置并关闭
    setTempSelectedGitIds([]);
    setDropdownOpen(false);
  };

  // 更新分支名称
  const handleBranchChange = (gitRepoId: string, branch: string) => {
    setSelectedGitRepos(selectedGitRepos.map(r =>
      r.gitRepoId === gitRepoId ? { ...r, baseBranch: branch } : r
    ));
  };

  // 移除已选择的Git仓库
  const handleRemoveGitRepo = (gitRepoId: string) => {
    setSelectedGitRepos(selectedGitRepos.filter(r => r.gitRepoId !== gitRepoId));
  };

  const handleSubmit = async () => {
    if (!selectedProject) {
      message.warning('请先选择项目');
      return;
    }
    if (!requirement.trim()) {
      message.warning('请输入需求描述');
      return;
    }

    // 验证所有选择的git仓库都填写了分支
    if (selectedGitRepos.length > 0) {
      const emptyBranchRepo = selectedGitRepos.find(r => !r.baseBranch.trim());
      if (emptyBranchRepo) {
        message.warning(`请为 ${emptyBranchRepo.gitRepoName} 填写基准分支`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await taskApi.create({
        projectId: selectedProject,
        title: requirement.split('\n')[0].slice(0, 50),
        description: requirement,
        createdBy: 'current-user',
        gitRepos: selectedGitRepos.length > 0 ? selectedGitRepos : undefined,
      });

      message.success('需求创建成功');
      setRequirement('');
      setSelectedGitRepos([]);
      loadTasks();

      // 跳转到任务详情页
      navigate(`/tasks/${response.data.data.id}`);
    } catch (error) {
      message.error('创建需求失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  // 处理待下发任务的下发操作
  const handleDeployRequirement = async (req: PendingRequirement) => {
    try {
      setLoading(true);
      const response = await taskApi.create({
        projectId: req.projectId,
        title: req.title,
        description: req.description,
        createdBy: 'current-user',
      });

      message.success('任务下发成功');

      // 跳转到任务详情页，URL会触发左侧任务列表自动刷新
      navigate(`/tasks/${response.data.data.id}`);
    } catch (error) {
      message.error('任务下发失败');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityTag = (priority: 'low' | 'medium' | 'high') => {
    const priorityMap = {
      low: { color: 'default', text: '低' },
      medium: { color: 'orange', text: '中' },
      high: { color: 'red', text: '高' },
    };
    const config = priorityMap[priority];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      in_progress: { color: 'processing', text: '进行中' },
      pending_confirm: { color: 'warning', text: '待确认' },
      completed: { color: 'success', text: '已完成' },
    };
    const config = statusMap[status] || statusMap.in_progress;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const tasksByProject = tasks.reduce((acc, task) => {
    if (!acc[task.projectId]) {
      acc[task.projectId] = [];
    }
    acc[task.projectId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 20px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: 'center',
            marginBottom: 32,
            fontSize: '28px',
            fontWeight: 600,
            color: '#1a1a1a',
          }}
        >
          专注设计与验证,让 AI 完成实现
        </Title>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div
            style={{
              position: 'relative',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '16px',
              background: '#ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 1,
              }}
            >
              <Select
                style={{ width: '200px' }}
                placeholder="选择项目"
                value={selectedProject}
                onChange={setSelectedProject}
                options={projects.map((p) => ({ label: p.name, value: p.id }))}
                notFoundContent={
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Empty description="暂无项目" />
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() => navigate('/assets')}
                    >
                      去添加项目
                    </Button>
                  </div>
                }
              />
            </div>

            {/* 已选择的Git仓库显示 - 每行2个，卡片式，内联输入分支 */}
            {selectedGitRepos.length > 0 && (
              <div style={{ marginTop: 48, marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {selectedGitRepos.map((repo) => (
                  <div
                    key={repo.gitRepoId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      padding: '12px',
                      background: '#f0f5ff',
                      borderRadius: 6,
                      border: '1px solid #adc6ff',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <GithubOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                      <Text strong style={{ fontSize: 13, color: '#1677ff', flex: 1 }}>
                        {repo.gitRepoName}
                      </Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleRemoveGitRepo(repo.gitRepoId)}
                        style={{ position: 'absolute', top: 4, right: 4 }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BranchesOutlined style={{ color: '#8c8c8c' }} />
                      <Input
                        size="small"
                        placeholder="基准分支 (如: main)"
                        value={repo.baseBranch}
                        onChange={(e) => handleBranchChange(repo.gitRepoId, e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ position: 'relative', marginTop: selectedGitRepos.length > 0 ? 0 : 48 }}>
              <Input.TextArea
                style={{
                  border: '1px solid #e0e0e0',
                  background: '#fafafa',
                  fontSize: '16px',
                  resize: 'none',
                  paddingBottom: '60px',
                  borderRadius: '8px',
                }}
                rows={5}
                placeholder={
                  selectedProject
                    ? '输入 @ 选择Git仓库，或直接描述您的需求...'
                    : '请先选择项目...'
                }
                value={requirement}
                onChange={handleRequirementChange}
                disabled={!selectedProject}
              />

              {/* Git仓库选择下拉框 - 在输入@时显示 */}
              {dropdownOpen && (
                <>
                  {/* 遮罩层 */}
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.45)',
                      zIndex: 999,
                    }}
                    onClick={() => {
                      setTempSelectedGitIds([]);
                      setDropdownOpen(false);
                      setRequirement(requirement.slice(0, -1));
                    }}
                  />
                  {/* 下拉框 - 使用 absolute 定位,相对于父容器 */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 1000,
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                    padding: '12px',
                    width: 350,
                  }}>
                    <div style={{
                      marginBottom: 12,
                      paddingBottom: 8,
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <Text strong>选择Git仓库</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {tempSelectedGitIds.length} 个已选
                      </Text>
                    </div>
                    <Checkbox.Group
                      style={{ width: '100%' }}
                      value={tempSelectedGitIds}
                      onChange={(values) => setTempSelectedGitIds(values as string[])}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {gitRepos.map(repo => {
                          const isAdded = selectedGitRepos.find(r => r.gitRepoId === repo.id);
                          return (
                            <Checkbox
                              key={repo.id}
                              value={repo.id}
                              disabled={!!isAdded}
                              style={{ width: '100%' }}
                            >
                              <Space>
                                <GithubOutlined style={{ color: isAdded ? '#d9d9d9' : '#1677ff' }} />
                                <Text
                                  style={{
                                    color: isAdded ? '#d9d9d9' : '#000',
                                  }}
                                >
                                  {repo.name}
                                </Text>
                                {isAdded && <Tag color="success" style={{ fontSize: 11 }}>已添加</Tag>}
                              </Space>
                            </Checkbox>
                          );
                        })}
                      </Space>
                    </Checkbox.Group>
                    <div style={{
                      marginTop: 12,
                      paddingTop: 8,
                      borderTop: '1px solid #f0f0f0',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 8,
                    }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setTempSelectedGitIds([]);
                          setDropdownOpen(false);
                          setRequirement(requirement.slice(0, -1)); // 移除@
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        onClick={handleConfirmGitSelection}
                      >
                        确认添加
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                right: '24px',
              }}
            >
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit}
                loading={loading}
                disabled={!selectedProject || !requirement.trim()}
                shape="circle"
                size="large"
                style={{
                  width: '40px',
                  height: '40px',
                }}
              />
            </div>
          </div>

          {/* 待下发任务列表 */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>待下发任务</span>
                {selectedProject && (
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 'normal' }}>
                    (已筛选项目：{projects.find(p => p.id === selectedProject)?.name})
                  </Text>
                )}
              </Space>
            }
            style={{
              marginTop: 24,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
            styles={{ body: { padding: '16px 24px' } }}
          >
            {requirementsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">加载中...</Text>
              </div>
            ) : pendingRequirements.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={selectedProject ? '该项目暂无待下发任务' : '暂无待下发任务'}
                style={{ padding: '20px 0' }}
              />
            ) : (
              <List
                dataSource={pendingRequirements}
                split={false}
                renderItem={(req) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      marginBottom: 8,
                      background: '#fafafa',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f0f5ff';
                      e.currentTarget.style.borderColor = '#1677ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fafafa';
                      e.currentTarget.style.borderColor = '#e8e8e8';
                    }}
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleDeployRequirement(req)}
                        loading={loading}
                      >
                        立即下发
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong style={{ fontSize: 14 }}>{req.title}</Text>
                          {getPriorityTag(req.priority)}
                          <Tag color="blue">{req.source}</Tag>
                          <Tag>{projects.find(p => p.id === req.projectId)?.name || '未知项目'}</Tag>
                        </Space>
                      }
                      description={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                          <Text type="secondary" ellipsis style={{ maxWidth: '700px' }}>
                            {req.description}
                          </Text>
                          <Space size="middle">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              创建时间: {new Date(req.createdAt).toLocaleString('zh-CN')}
                            </Text>
                            {req.sourceUrl && (
                              <a
                                href={req.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkOutlined style={{ marginRight: 4 }} />
                                查看需求详情
                              </a>
                            )}
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Space>
      </div>
    </div>
  );
};

export default HomePage;
















