import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'antd';
import { SendOutlined, LinkOutlined, ClockCircleOutlined, GithubOutlined, BranchesOutlined } from '@ant-design/icons';
import { spaceApi, taskApi } from '../services/api';
import type { Task, PendingRequirement, GitRepo, TaskGitRepo } from '../types';
import { useSpace } from '../contexts/SpaceContext';

const { Title, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentSpace } = useSpace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingRequirements, setPendingRequirements] = useState<PendingRequirement[]>([]);
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [requirementsLoading, setRequirementsLoading] = useState(false);

  // Git相关状态
  const [gitRepos, setGitRepos] = useState<GitRepo[]>([]);
  const [selectedGitRepos, setSelectedGitRepos] = useState<TaskGitRepo[]>([]);

  // @任务相关状态
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(-1);
  const [selectedRequirement, setSelectedRequirement] = useState<PendingRequirement | null>(null);
  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    if (currentSpace) {
      loadTasks();
      loadPendingRequirements();
      loadGitRepos();
    }
  }, [currentSpace]);

  // 检查路由状态，自动选中需求
  useEffect(() => {
    const state = location.state as { selectedRequirement?: PendingRequirement } | null;
    if (state?.selectedRequirement) {
      setSelectedRequirement(state.selectedRequirement);
      // 清除路由状态，避免刷新时重复选中
      navigate(location.pathname, { replace: true, state: {} });
      // 聚焦输入框
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
        }
      }, 100);
    }
  }, [location.state]);

  const loadTasks = async () => {
    if (!currentSpace) return;

    try {
      const response = await taskApi.getAll({ spaceId: currentSpace.id });
      setTasks(response.data.data);
    } catch (error) {
      message.error('加载任务列表失败');
    }
  };

  const loadPendingRequirements = async () => {
    if (!currentSpace) return;

    try {
      setRequirementsLoading(true);
      const response = await taskApi.getPendingRequirements({ spaceId: currentSpace.id });
      setPendingRequirements(response.data.data);
    } catch (error) {
      message.error('加载待下发任务失败');
    } finally {
      setRequirementsLoading(false);
    }
  };

  const loadGitRepos = async () => {
    if (!currentSpace) return;

    try {
      const response = await spaceApi.getRepos(currentSpace.id);
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

    // 检测是否输入了@且有待下发任务
    if (value.endsWith('@') && pendingRequirements.length > 0) {
      setDropdownOpen(true);
      setSelectedTaskIndex(0);
    }
  };

  // 处理键盘事件 - 上下键切换选择
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedTaskIndex(prev =>
        prev < pendingRequirements.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedTaskIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && selectedTaskIndex >= 0) {
      e.preventDefault();
      handleSelectTask(pendingRequirements[selectedTaskIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
      setSelectedTaskIndex(-1);
      setRequirement(requirement.slice(0, -1));
    }
  };

  // 选择任务
  const handleSelectTask = (task: PendingRequirement) => {
    // 移除输入框中的@
    setRequirement(requirement.slice(0, -1));
    // 设置选中的需求
    setSelectedRequirement(task);
    setDropdownOpen(false);
    setSelectedTaskIndex(-1);

    // 重新聚焦输入框
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  // 取消选择需求
  const handleCancelRequirement = () => {
    setSelectedRequirement(null);
    setRequirement('');
  };

  // 更新分支名称
  const handleBranchChange = (gitRepoId: string, branch: string) => {
    setSelectedGitRepos(selectedGitRepos.map(r =>
      r.gitRepoId === gitRepoId ? { ...r, baseBranch: branch } : r
    ));
  };

  const handleSubmit = async () => {
    if (!currentSpace) {
      message.warning('请先选择空间');
      return;
    }

    // 如果选中了待下发需求，则下发该需求
    if (selectedRequirement) {
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
        // 下发任务，使用选中需求的信息 + 补充信息
        const description = requirement.trim()
          ? `${selectedRequirement.description}\n\n补充信息：\n${requirement}`
          : selectedRequirement.description;

        const response = await taskApi.create({
          spaceId: currentSpace.id,
          title: selectedRequirement.title,
          description: description,
          createdBy: 'current-user',
          gitRepos: selectedGitRepos.length > 0 ? selectedGitRepos : undefined,
        });

        message.success('任务下发成功');
        setRequirement('');
        setSelectedGitRepos([]);
        setSelectedRequirement(null);
        loadTasks();
        loadPendingRequirements(); // 刷新待下发任务列表

        // 跳转到任务详情页
        navigate(`/tasks/${response.data.data.id}`);
      } catch (error) {
        message.error('任务下发失败');
      } finally {
        setLoading(false);
      }
    } else {
      // 创建新任务
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
          spaceId: currentSpace.id,
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
    }
  };

  // 处理待下发任务的下发操作 - 跳转到首页并自动选中
  const handleDeployRequirement = (req: PendingRequirement) => {
    // 直接设置选中的需求，不需要跳转因为已经在首页了
    setSelectedRequirement(req);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 聚焦输入框
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 300);
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

  if (!currentSpace) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <Empty description="请先选择一个空间" />
      </div>
    );
  }

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
            {/* 选中需求的显示 */}
            {selectedRequirement && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: '#e6f4ff',
                  borderRadius: 6,
                  border: '1px solid #91caff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 12, color: '#0958d9', marginRight: 8 }}>
                    已选需求：
                  </Text>
                  <Text strong style={{ fontSize: 13, color: '#0958d9' }}>
                    {selectedRequirement.title}
                  </Text>
                </div>
                <Button
                  type="text"
                  size="small"
                  onClick={handleCancelRequirement}
                  style={{ color: '#0958d9' }}
                >
                  取消
                </Button>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Input.TextArea
                ref={textAreaRef}
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
                  currentSpace
                    ? selectedRequirement
                      ? '输入补充信息（可选），选择仓库和分支后点击发送下发任务'
                      : '输入 @ 可选择待下发任务，或直接输入需求描述后点击发送'
                    : '请先选择空间...'
                }
                value={requirement}
                onChange={handleRequirementChange}
                onKeyDown={handleKeyDown}
                disabled={!currentSpace}
              />

              {/* 待下发任务选择下拉框 - 在输入@时显示 */}
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
                      setDropdownOpen(false);
                      setSelectedTaskIndex(-1);
                      setRequirement(requirement.slice(0, -1));
                    }}
                  />
                  {/* 下拉框 - 使用 absolute 定位,相对于父容器 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      zIndex: 1000,
                      background: '#fff',
                      borderRadius: 8,
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                      padding: '8px 0',
                      width: 450,
                      maxHeight: 400,
                      overflow: 'auto',
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 12px',
                        marginBottom: 4,
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <Text strong style={{ fontSize: 13 }}>
                        选择待下发任务
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                        ({pendingRequirements.length} 个)
                      </Text>
                    </div>
                    <div>
                      {pendingRequirements.map((task, index) => (
                        <div
                          key={task.id}
                          onClick={() => handleSelectTask(task)}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            background:
                              selectedTaskIndex === index ? '#e6f4ff' : 'transparent',
                            borderLeft:
                              selectedTaskIndex === index
                                ? '3px solid #1677ff'
                                : '3px solid transparent',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (selectedTaskIndex !== index) {
                              e.currentTarget.style.background = '#f5f5f5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedTaskIndex !== index) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              strong
                              ellipsis
                              style={{
                                fontSize: 13,
                                flex: 1,
                                color:
                                  selectedTaskIndex === index ? '#1677ff' : '#000',
                              }}
                            >
                              {task.title}
                            </Text>
                            {getPriorityTag(task.priority)}
                          </div>
                          <Text
                            type="secondary"
                            ellipsis
                            style={{ fontSize: 12, display: 'block' }}
                          >
                            {task.description}
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Tag color="blue" style={{ fontSize: 11 }}>
                              {task.source}
                            </Tag>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 输入框下方的 Git 仓库和分支选择器 */}
              <div style={{
                marginTop: 12,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GithubOutlined style={{ fontSize: 14, color: '#595959' }} />
                  <Text style={{ fontSize: 13, color: '#262626' }}>
                    <span style={{ color: '#ff4d4f' }}>*</span> 搜索仓库
                  </Text>
                </div>
                <Select
                  mode="multiple"
                  placeholder="选择Git仓库"
                  bordered={false}
                  style={{
                    width: 200,
                    fontSize: 13,
                  }}
                  size="small"
                  value={selectedGitRepos.map(r => r.gitRepoId)}
                  onChange={(values) => {
                    // 处理选择变化
                    const newRepos: TaskGitRepo[] = values.map(gitId => {
                      const existing = selectedGitRepos.find(r => r.gitRepoId === gitId);
                      if (existing) return existing;

                      const repo = gitRepos.find(r => r.id === gitId);
                      return {
                        id: `temp-${Date.now()}-${gitId}`,
                        gitRepoId: gitId,
                        gitRepoName: repo?.name || '',
                        baseBranch: '',
                      };
                    });
                    setSelectedGitRepos(newRepos);
                  }}
                  options={gitRepos.map(repo => ({
                    label: repo.name,
                    value: repo.id,
                  }))}
                  maxTagCount="responsive"
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BranchesOutlined style={{ fontSize: 14, color: '#595959' }} />
                  <Text style={{ fontSize: 13, color: '#262626' }}>
                    <span style={{ color: '#ff4d4f' }}>*</span> 搜索分支
                  </Text>
                </div>
                <Select
                  mode="tags"
                  placeholder="输入基准分支"
                  bordered={false}
                  style={{
                    width: 200,
                    fontSize: 13,
                  }}
                  size="small"
                  value={selectedGitRepos.map(r => r.baseBranch).filter(Boolean)}
                  onChange={(values) => {
                    // 如果只有一个仓库，直接设置分支
                    if (selectedGitRepos.length === 1 && values.length > 0) {
                      handleBranchChange(selectedGitRepos[0].gitRepoId, values[values.length - 1]);
                    }
                  }}
                  disabled={selectedGitRepos.length === 0}
                  maxTagCount="responsive"
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                }}
              >
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!currentSpace || (!selectedRequirement && !requirement.trim())}
                  shape="circle"
                  size="large"
                  style={{
                    width: '40px',
                    height: '40px',
                  }}
                  title={selectedRequirement ? '下发任务' : '发送'}
                />
              </div>
            </div>
          </div>

          {/* 待下发任务列表 */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>待下发任务</span>
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
                description="暂无待下发任务"
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























