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
} from 'antd';
import { SendOutlined, PlusOutlined, LinkOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { projectApi, taskApi } from '../services/api';
import type { Project, Task, PendingRequirement } from '../types';

const { TextArea } = Input;
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

  useEffect(() => {
    loadProjects();
    loadTasks();
    loadPendingRequirements();
  }, []);

  useEffect(() => {
    // 当选择项目后，重新加载该项目的待下发任务
    if (selectedProject) {
      loadPendingRequirements(selectedProject);
    } else {
      loadPendingRequirements();
    }
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

  const handleSubmit = async () => {
    if (!selectedProject) {
      message.warning('请先选择项目');
      return;
    }
    if (!requirement.trim()) {
      message.warning('请输入需求描述');
      return;
    }

    setLoading(true);
    try {
      const response = await taskApi.create({
        projectId: selectedProject,
        title: requirement.split('\n')[0].slice(0, 50),
        description: requirement,
        createdBy: 'current-user',
      });

      message.success('需求创建成功');
      setRequirement('');
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

  const collapseItems = projects
    .filter((project) => tasksByProject[project.id]?.length > 0)
    .map((project) => ({
      key: project.id,
      label: (
        <Space>
          <Text strong>{project.name}</Text>
          <Tag>{tasksByProject[project.id]?.length || 0}个任务</Tag>
        </Space>
      ),
      children: (
        <List
          dataSource={tasksByProject[project.id] || []}
          renderItem={(task) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => handleTaskClick(task.id)}
              actions={[getStatusTag(task.status)]}
            >
              <List.Item.Meta
                title={task.title}
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary" ellipsis style={{ maxWidth: '600px' }}>
                      {task.description}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      创建时间: {new Date(task.createdAt).toLocaleString('zh-CN')}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ),
    }));

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

            <TextArea
              style={{
                marginTop: 48,
                border: '1px solid #e0e0e0',
                background: '#fafafa',
                fontSize: '16px',
                resize: 'none',
                paddingBottom: '60px',
                borderRadius: '8px',
              }}
              rows={5}
              placeholder="请选择仓库和分支,@ 需求后补充说明或直接详细描述您的需求..."
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
            />

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









