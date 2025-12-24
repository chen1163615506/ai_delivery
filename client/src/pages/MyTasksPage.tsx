import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Badge,
  Empty,
  Spin,
  Typography,
  Tag,
  Space,
  Button,
  Drawer,
  List,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { taskApi } from '../services/api';
import type { Task, PendingRequirement } from '../types';

const { Title, Text } = Typography;

// 待决策事项类型
interface DecisionItem {
  id: string;
  type: 'cr_request' | 'blocked' | 'confirmation_needed';
  taskId: string;
  taskTitle: string;
  description: string;
  createdAt: Date | string;
}

const MyTasksPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingRequirements, setPendingRequirements] = useState<PendingRequirement[]>([]);
  const [decisionItems, setDecisionItems] = useState<DecisionItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Mock数据
      const mockPendingRequirements: PendingRequirement[] = [
        {
          id: 'pending-1',
          projectId: 'proj-1',
          title: '用户登录页面优化',
          description: '优化登录页面UI，增加记住密码功能',
          source: 'Jira',
          sourceUrl: 'https://jira.example.com/browse/PROJ-123',
          priority: 'high',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: 'pending-2',
          projectId: 'proj-1',
          title: '商品列表分页功能',
          description: '实现商品列表的分页加载功能',
          source: 'Tapd',
          priority: 'medium',
          createdAt: new Date('2024-01-16'),
        },
      ];

      const mockTasks: Task[] = [
        {
          id: 'task-1',
          projectId: 'proj-1',
          title: '支付模块重构',
          description: '重构支付模块，支持多种支付方式',
          status: 'in_progress',
          createdBy: 'user1',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
        },
        {
          id: 'task-2',
          projectId: 'proj-1',
          title: '订单查询API优化',
          description: '优化订单查询接口性能，添加缓存机制',
          status: 'in_progress',
          createdBy: 'user1',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-17'),
        },
        {
          id: 'task-3',
          projectId: 'proj-1',
          title: '用户权限管理功能',
          description: '实现基于角色的用户权限管理系统',
          status: 'pending_confirm',
          createdBy: 'user1',
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-16'),
        },
        {
          id: 'task-4',
          projectId: 'proj-1',
          title: '数据统计报表',
          description: '开发数据统计报表功能，支持多维度分析',
          status: 'pending_confirm',
          createdBy: 'user1',
          createdAt: new Date('2024-01-09'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'task-5',
          projectId: 'proj-1',
          title: '消息推送功能',
          description: '实现站内消息和邮件推送功能',
          status: 'completed',
          createdBy: 'user1',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-14'),
          completedAt: new Date('2024-01-14'),
        },
      ];

      setTasks(mockTasks);
      setPendingRequirements(mockPendingRequirements);

      // TODO: 从后端获取真实的待决策事项
      setDecisionItems([
        {
          id: '1',
          type: 'cr_request',
          taskId: mockTasks[0]?.id || '',
          taskTitle: mockTasks[0]?.title || '',
          description: '张三发起了代码审查请求',
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 按状态分组任务
  const tasksByStatus = {
    pending: pendingRequirements,
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    pending_confirm: tasks.filter(t => t.status === 'pending_confirm'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: '#faad14',
      in_progress: '#1677ff',
      pending_confirm: '#722ed1',
      completed: '#52c41a',
    };
    return colorMap[status] || '#d9d9d9';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />;
      case 'in_progress':
        return <SyncOutlined spin />;
      case 'pending_confirm':
        return <ExclamationCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getDecisionTypeText = (type: string) => {
    const typeMap: Record<string, { text: string; color: string }> = {
      cr_request: { text: 'CR请求', color: 'blue' },
      blocked: { text: '需求卡点', color: 'red' },
      confirmation_needed: { text: '待补充确认', color: 'orange' },
    };
    return typeMap[type] || { text: '待处理', color: 'default' };
  };

  const handleDecisionItemClick = (item: DecisionItem) => {
    // 跳转到任务详情页的会话处
    navigate(`/tasks/${item.taskId}#conversation`);
    setDrawerOpen(false);
  };

  const handleStartAnalysis = (requirementId: string) => {
    // 创建任务并开始需求分析
    message.success('开始需求分析...');
    // TODO: 调用后端API创建任务
    navigate(`/tasks/${requirementId}`);
  };

  const handleViewReport = (taskId: string) => {
    // 跳转到任务详情的交付报告
    navigate(`/tasks/${taskId}#report`);
  };

  const renderSwimLane = (
    title: string,
    status: string,
    items: (Task | PendingRequirement)[]
  ) => (
    <Card
      title={
        <Space>
          {getStatusIcon(status)}
          <span>{title}</span>
          <Badge count={items.length} style={{ backgroundColor: getStatusColor(status) }} />
        </Space>
      }
      style={{
        flex: 1,
        minWidth: 280,
        maxWidth: 350,
      }}
      styles={{
        body: {
          padding: '12px',
          maxHeight: 'calc(100vh - 250px)',
          overflow: 'auto',
        },
      }}
    >
      {items.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无任务"
          style={{ padding: '20px 0' }}
        />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {items.map((item) => {
            const isTask = 'status' in item;
            return (
              <Card
                key={item.id}
                size="small"
                hoverable
                style={{
                  borderLeft: `3px solid ${getStatusColor(status)}`,
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text strong ellipsis style={{ fontSize: 13 }}>
                    {item.title}
                  </Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text
                    type="secondary"
                    ellipsis
                    style={{ fontSize: 12, display: 'block' }}
                  >
                    {item.description}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                  {!isTask && 'priority' in item && (
                    <Tag color={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'default'}>
                      {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                    </Tag>
                  )}
                </div>
                {/* 操作按钮 */}
                <div style={{ marginTop: 8 }}>
                  {status === 'pending' && !isTask && (
                    <Button
                      type="primary"
                      size="small"
                      block
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartAnalysis(item.id);
                      }}
                    >
                      立即下发
                    </Button>
                  )}
                  {status === 'in_progress' && isTask && (
                    <Button
                      size="small"
                      block
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tasks/${item.id}`);
                      }}
                    >
                      查看详情
                    </Button>
                  )}
                  {status === 'pending_confirm' && isTask && (
                    <Button
                      type="primary"
                      size="small"
                      block
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(item.id);
                      }}
                    >
                      去确认
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </Space>
      )}
    </Card>
  );

  return (
    <div style={{ padding: '24px 32px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          我的任务
        </Title>
        <Badge count={decisionItems.length} offset={[-5, 5]}>
          <Button
            type="primary"
            danger
            icon={<BellOutlined />}
            onClick={() => setDrawerOpen(true)}
            size="large"
            style={{
              fontWeight: 600,
              boxShadow: decisionItems.length > 0 ? '0 0 10px rgba(255, 77, 79, 0.5)' : 'none',
            }}
          >
            待我决策
          </Button>
        </Badge>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 16,
          }}
        >
          {renderSwimLane('待下发任务', 'pending', tasksByStatus.pending)}
          {renderSwimLane('进行中任务', 'in_progress', tasksByStatus.in_progress)}
          {renderSwimLane('待确认任务', 'pending_confirm', tasksByStatus.pending_confirm)}
          {renderSwimLane('已完成任务', 'completed', tasksByStatus.completed)}
        </div>
      )}

      {/* 待决策抽屉 */}
      <Drawer
        title={
          <Space>
            <BellOutlined />
            <span>待我决策</span>
            <Badge count={decisionItems.length} />
          </Space>
        }
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
      >
        {decisionItems.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无待决策事项"
            style={{ marginTop: 60 }}
          />
        ) : (
          <List
            dataSource={decisionItems}
            renderItem={(item) => {
              const typeInfo = getDecisionTypeText(item.type);
              return (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '16px',
                    background: '#fafafa',
                    borderRadius: 8,
                    marginBottom: 12,
                    border: '1px solid #e8e8e8',
                  }}
                  onClick={() => handleDecisionItemClick(item)}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
                        <Text strong style={{ fontSize: 14 }}>
                          {item.taskTitle}
                        </Text>
                      </Space>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {item.description}
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {new Date(item.createdAt).toLocaleString('zh-CN')}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Drawer>
    </div>
  );
};

export default MyTasksPage;
