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
  Avatar,
  Tooltip,
  Statistic,
  Progress,
  Row,
  Col,
  Divider,
  Radio,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Segmented,
  DatePicker,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

// 扩展dayjs以支持周的计算
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
import {
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  UserOutlined,
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  SendOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { taskApi } from '../services/api';
import type { Task, PendingRequirement } from '../types';
import { useSpace } from '../contexts/SpaceContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TaskBoardPage = () => {
  const navigate = useNavigate();
  const { currentSpace } = useSpace();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingRequirements, setPendingRequirements] = useState<PendingRequirement[]>([]);
  const [statsDrawerOpen, setStatsDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'team' | 'personal'>('team');

  // 时间筛选相关状态
  const [timeRangeType, setTimeRangeType] = useState<'thisWeek' | 'lastWeek' | 'thisMonth' | 'custom'>('thisWeek');
  const [customDateRange, setCustomDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const [form] = Form.useForm();

  // 当前用户ID（Mock数据，实际应从用户上下文获取）
  const currentUserId = 'user1';

  // 获取时间范围
  const getDateRange = (): [Dayjs, Dayjs] => {
    const now = dayjs();

    switch (timeRangeType) {
      case 'thisWeek':
        return [now.startOf('week'), now.endOf('week')];
      case 'lastWeek':
        return [now.subtract(1, 'week').startOf('week'), now.subtract(1, 'week').endOf('week')];
      case 'thisMonth':
        return [now.startOf('month'), now.endOf('month')];
      case 'custom':
        return customDateRange || [now.startOf('week'), now.endOf('week')];
      default:
        return [now.startOf('week'), now.endOf('week')];
    }
  };

  useEffect(() => {
    if (currentSpace) {
      loadData();
    }
  }, [currentSpace]);

  const loadData = async () => {
    if (!currentSpace) return;

    try {
      setLoading(true);

      // 获取当前空间的任务和待下发需求
      const tasksResponse = await taskApi.getAll({ spaceId: currentSpace.id });
      setTasks(tasksResponse.data.data);

      const requirementsResponse = await taskApi.getPendingRequirements({ spaceId: currentSpace.id });
      setPendingRequirements(requirementsResponse.data.data);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };


  // 时间范围筛选函数
  const isInDateRange = (date: Date | string) => {
    const [startDate, endDate] = getDateRange();
    const targetDate = dayjs(date);
    return targetDate.isAfter(startDate.subtract(1, 'day')) && targetDate.isBefore(endDate.add(1, 'day'));
  };

  // 按状态分组任务（根据视角和时间筛选）
  const tasksByStatus = {
    // 任务池：根据视角和时间过滤
    pending: pendingRequirements.filter(req => {
      // 必须有人未下发
      const hasPending = req.assignees && req.assignees.some(a => a.status === 'pending');
      if (!hasPending) return false;

      // 时间过滤
      if (!isInDateRange(req.createdAt)) return false;

      // 个人视角：只显示分配给我且我未下发的
      if (viewMode === 'personal') {
        return req.assignees?.some(a => a.userId === currentUserId && a.status === 'pending');
      }

      // 团队视角：显示所有
      return true;
    }),

    // 进行中、待确认、已完成：根据视角和时间过滤
    in_progress: tasks.filter(t => {
      if (!isInDateRange(t.createdAt)) return false;
      if (viewMode === 'personal') {
        return t.status === 'in_progress' && t.createdBy === currentUserId;
      }
      return t.status === 'in_progress';
    }),

    pending_confirm: tasks.filter(t => {
      if (!isInDateRange(t.createdAt)) return false;
      if (viewMode === 'personal') {
        return t.status === 'pending_confirm' && t.createdBy === currentUserId;
      }
      return t.status === 'pending_confirm';
    }),

    completed: tasks.filter(t => {
      if (!isInDateRange(t.createdAt)) return false;
      if (viewMode === 'personal') {
        return t.status === 'completed' && t.createdBy === currentUserId;
      }
      return t.status === 'completed';
    }),
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: '#13c2c2', // 任务池改为青色
      in_progress: '#1677ff',
      pending_confirm: '#722ed1',
      completed: '#52c41a',
    };
    return colorMap[status] || '#d9d9d9';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <DatabaseOutlined />; // 任务池用数据库图标
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

  const handleCreateRequirement = async (values: any) => {
    try {
      // TODO: 调用后端API创建需求
      console.log('创建需求:', values);
      message.success('需求创建成功');
      setCreateModalOpen(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('创建需求失败');
    }
  };

  const handleDispatchTask = (requirement: PendingRequirement) => {
    // 跳转到首页并传递选中的需求
    navigate('/', { state: { selectedRequirement: requirement } });
  };

  // 根据时间和视角筛选任务用于统计
  const filteredTasks = tasks.filter((task) => {
    if (!isInDateRange(task.createdAt)) return false;
    if (viewMode === 'personal' && task.createdBy !== currentUserId) {
      return false;
    }
    return true;
  });
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  // 计算总耗时（天数）
  const totalDays = completedTasks.reduce((sum, task) => {
    if (task.completedAt && task.createdAt) {
      const days = Math.ceil(
        (new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }
    return sum;
  }, 0);

  // 计算平均耗时
  const avgDays = completedTasks.length > 0 ? (totalDays / completedTasks.length).toFixed(1) : 0;

  // Mock总成本（基于任务数量）
  const totalCost = filteredTasks.length * 1500; // 假设每个任务平均1500元

  const renderSwimLane = (
    title: string,
    status: string,
    items: (Task | PendingRequirement)[]
  ) => (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Space>
            {getStatusIcon(status)}
            <span>{title}</span>
            <span style={{ fontSize: 14, color: '#999', fontWeight: 'normal' }}>({items.length})</span>
          </Space>
          {status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setCreateModalOpen(true);
              }}
              style={{ fontSize: 12 }}
            >
              创建
            </Button>
          )}
        </div>
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
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text strong ellipsis style={{ fontSize: 13, flex: 1 }}>
                    {item.title}
                  </Text>
                  {/* 创建人显示编辑图标 */}
                  {!isTask && 'createdBy' in item && item.createdBy === 'user1' && (
                    <Tooltip title="编辑">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        style={{ padding: 0, width: 20, height: 20, minWidth: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          message.info('编辑功能开发中');
                        }}
                      />
                    </Tooltip>
                  )}
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

                {/* 任务池需求：显示分配人员和下发进度 */}
                {!isTask && 'assignees' in item && item.assignees && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>分配人员</Text>
                      <Tag color="cyan" style={{ fontSize: 10, padding: '0 4px', lineHeight: '18px' }}>
                        {item.assignees.filter(a => a.status === 'dispatched').length}/{item.assignees.length}
                      </Tag>
                    </div>
                    <Avatar.Group maxCount={3} size={24}>
                      {item.assignees.map((assignee) => (
                        <Tooltip
                          key={assignee.userId}
                          title={`${assignee.userName} - ${assignee.status === 'dispatched' ? '已下发' : '待下发'}`}
                        >
                          <Badge
                            count={assignee.status === 'dispatched' ? <CheckOutlined style={{ color: '#52c41a', fontSize: 10 }} /> : 0}
                            offset={[-2, 2]}
                          >
                            <Avatar
                              style={{
                                backgroundColor: assignee.status === 'dispatched' ? '#52c41a' : '#1677ff',
                                opacity: assignee.status === 'dispatched' ? 0.7 : 1,
                              }}
                              icon={<UserOutlined />}
                            />
                          </Badge>
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                  </div>
                )}

                {/* 进行中任务：显示执行人 */}
                {isTask && 'createdBy' in item && (
                  <div style={{ marginBottom: 8 }}>
                    <Tooltip title={item.createdBy}>
                      <Space size={4}>
                        <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {item.createdBy}
                        </Text>
                      </Space>
                    </Tooltip>
                  </div>
                )}

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
                  {/* 任务池需求的操作 */}
                  {status === 'pending' && !isTask && 'assignees' in item && (
                    <>
                      {/* 当前用户可以下发自己的任务 */}
                      {item.assignees?.some(a => a.userId === currentUserId && a.status === 'pending') && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<SendOutlined />}
                          block
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchTask(item as PendingRequirement);
                          }}
                        >
                          下发任务
                        </Button>
                      )}
                    </>
                  )}

                  {/* 进行中任务的操作 */}
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

                  {/* 待确认任务的操作 */}
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

                  {/* 已完成任务的操作 */}
                  {status === 'completed' && isTask && (
                    <Button
                      size="small"
                      block
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(item.id);
                      }}
                    >
                      查看报告
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
        <Space size="large">
          <Title level={4} style={{ margin: 0 }}>
            {currentSpace?.name} - 任务看板
          </Title>
          {/* 视角切换 */}
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as 'team' | 'personal')}
            options={[
              { label: '团队视角', value: 'team' },
              { label: '个人视角', value: 'personal' },
            ]}
          />
        </Space>
        {/* 时间筛选 */}
        <Space>
          <Radio.Group
            value={timeRangeType}
            onChange={(e) => {
              setTimeRangeType(e.target.value);
              if (e.target.value !== 'custom') {
                setCustomDateRange(null);
              }
            }}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="thisWeek">本周</Radio.Button>
            <Radio.Button value="lastWeek">上周</Radio.Button>
            <Radio.Button value="thisMonth">本月</Radio.Button>
            <Radio.Button value="custom">自定义</Radio.Button>
          </Radio.Group>
          {timeRangeType === 'custom' && (
            <RangePicker
              value={customDateRange}
              onChange={(dates) => setCustomDateRange(dates as [Dayjs, Dayjs])}
              style={{ width: 260 }}
              placeholder={['开始日期', '结束日期']}
            />
          )}
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* 概览统计区域 */}
          <div style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 8,
                    border: 'none'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#fff', opacity: 0.9, fontSize: 12 }}>任务数</span>}
                    value={filteredTasks.length}
                    suffix={<span style={{ color: '#fff', opacity: 0.8, fontSize: 14 }}>个</span>}
                    valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 8,
                    border: 'none'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#fff', opacity: 0.9, fontSize: 12 }}>已交付</span>}
                    value={completedTasks.length}
                    suffix={<span style={{ color: '#fff', opacity: 0.8, fontSize: 14 }}>个</span>}
                    valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 8,
                    border: 'none'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#fff', opacity: 0.9, fontSize: 12 }}>平均耗时</span>}
                    value={avgDays}
                    suffix={<span style={{ color: '#fff', opacity: 0.8, fontSize: 14 }}>天</span>}
                    valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
                    precision={1}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => setStatsDrawerOpen(true)}
                  style={{
                    background: '#f5f5f5',
                    borderRadius: 8,
                    border: '1px dashed #d9d9d9',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                  styles={{ body: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } }}
                >
                  <Space direction="vertical" align="center">
                    <BarChartOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                    <Text style={{ fontSize: 13, color: '#666' }}>查看详细统计</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>

          {/* 任务泳道 */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              paddingBottom: 16,
            }}
          >
            {renderSwimLane('任务池', 'pending', tasksByStatus.pending)}
            {renderSwimLane('进行中任务', 'in_progress', tasksByStatus.in_progress)}
            {renderSwimLane('待确认任务', 'pending_confirm', tasksByStatus.pending_confirm)}
            {renderSwimLane('已完成任务', 'completed', tasksByStatus.completed)}
          </div>
        </>
      )}

      {/* 数据统计抽屉 */}
      <Drawer
        title={
          <Space>
            <BarChartOutlined />
            <span>详细统计</span>
          </Space>
        }
        placement="right"
        open={statsDrawerOpen}
        onClose={() => setStatsDrawerOpen(false)}
        width={800}
      >
        <div>
          {/* 任务状态分布和人员矩阵 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Card title="任务状态分布" style={{ height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space size={4}>
                        <ClockCircleOutlined style={{ color: '#faad14', fontSize: 12 }} />
                        <Text style={{ fontSize: 12 }}>待下发</Text>
                      </Space>
                      <Text strong style={{ fontSize: 12 }}>{tasksByStatus.pending.length}</Text>
                    </div>
                    <Progress
                      percent={
                        (tasks.length + pendingRequirements.length) > 0
                          ? Math.round(
                              (tasksByStatus.pending.length / (tasks.length + pendingRequirements.length)) * 100
                            )
                          : 0
                      }
                      strokeColor="#faad14"
                      showInfo={false}
                      size="small"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space size={4}>
                        <SyncOutlined spin style={{ color: '#1677ff', fontSize: 12 }} />
                        <Text style={{ fontSize: 12 }}>进行中</Text>
                      </Space>
                      <Text strong style={{ fontSize: 12 }}>{tasksByStatus.in_progress.length}</Text>
                    </div>
                    <Progress
                      percent={
                        (tasks.length + pendingRequirements.length) > 0
                          ? Math.round(
                              (tasksByStatus.in_progress.length / (tasks.length + pendingRequirements.length)) * 100
                            )
                          : 0
                      }
                      strokeColor="#1677ff"
                      showInfo={false}
                      size="small"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space size={4}>
                        <ExclamationCircleOutlined style={{ color: '#722ed1', fontSize: 12 }} />
                        <Text style={{ fontSize: 12 }}>待确认</Text>
                      </Space>
                      <Text strong style={{ fontSize: 12 }}>{tasksByStatus.pending_confirm.length}</Text>
                    </div>
                    <Progress
                      percent={
                        (tasks.length + pendingRequirements.length) > 0
                          ? Math.round(
                              (tasksByStatus.pending_confirm.length / (tasks.length + pendingRequirements.length)) * 100
                            )
                          : 0
                      }
                      strokeColor="#722ed1"
                      showInfo={false}
                      size="small"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Space size={4}>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                        <Text style={{ fontSize: 12 }}>已完成</Text>
                      </Space>
                      <Text strong style={{ fontSize: 12 }}>{tasksByStatus.completed.length}</Text>
                    </div>
                    <Progress
                      percent={
                        (tasks.length + pendingRequirements.length) > 0
                          ? Math.round(
                              (tasksByStatus.completed.length / (tasks.length + pendingRequirements.length)) * 100
                            )
                          : 0
                      }
                      strokeColor="#52c41a"
                      showInfo={false}
                      size="small"
                    />
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="人员工作量" style={{ height: '100%' }}>
                <Table
                  dataSource={(() => {
                    const userTaskCount: Record<string, number> = {};
                    filteredTasks.forEach((task) => {
                      if (task.createdBy) {
                        userTaskCount[task.createdBy] = (userTaskCount[task.createdBy] || 0) + 1;
                      }
                    });

                    return Object.entries(userTaskCount).map(([user, count]) => ({
                      key: user,
                      user,
                      count,
                    }));
                  })()}
                  columns={[
                    {
                      title: '人员',
                      dataIndex: 'user',
                      key: 'user',
                      render: (user: string) => (
                        <Space>
                          <Avatar size={24} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                          <Text>{user}</Text>
                        </Space>
                      ),
                    },
                    {
                      title: '需求数',
                      dataIndex: 'count',
                      key: 'count',
                      align: 'right',
                      render: (count: number) => <Tag color="blue">{count}</Tag>,
                    },
                  ]}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: '暂无数据' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 需求来源分析 */}
          <Card title="需求来源分析">
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {(() => {
                // 根据视角过滤需求
                const filteredRequirements = viewMode === 'personal'
                  ? pendingRequirements.filter(req =>
                      req.assignees?.some(a => a.userId === currentUserId)
                    )
                  : pendingRequirements;

                const sourceCount: Record<string, number> = {};
                filteredRequirements.forEach((req) => {
                  sourceCount[req.source] = (sourceCount[req.source] || 0) + 1;
                });

                return Object.entries(sourceCount).map(([source, count]) => (
                  <div
                    key={source}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                    }}
                  >
                    <Text>{source}</Text>
                    <Tag color="blue">{count}个</Tag>
                  </div>
                ));
              })()}

              {(() => {
                const filteredRequirements = viewMode === 'personal'
                  ? pendingRequirements.filter(req =>
                      req.assignees?.some(a => a.userId === currentUserId)
                    )
                  : pendingRequirements;
                return filteredRequirements.length === 0;
              })() && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无待下发需求"
                  style={{ padding: '20px 0' }}
                />
              )}
            </Space>
          </Card>
        </div>
      </Drawer>

      {/* 创建需求弹窗 */}
      <Modal
        title="创建需求"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRequirement}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="需求名称"
            rules={[{ required: true, message: '请输入需求名称' }]}
          >
            <Input placeholder="请输入需求名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="需求描述"
            rules={[{ required: true, message: '请输入需求描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请详细描述需求内容" />
          </Form.Item>

          <Form.Item name="imageUrl" label="图片链接">
            <Input placeholder="可选：粘贴图片URL" />
          </Form.Item>

          <Form.Item name="documentUrl" label="文档链接">
            <Input placeholder="可选：粘贴文档链接（需求文档、PRD等）" />
          </Form.Item>

          <Form.Item
            name="assignees"
            label="分配人员"
            rules={[{ required: true, message: '请选择至少一位分配人员' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择分配人员（可多选）"
              options={[
                { label: '张三', value: 'user1' },
                { label: '李四', value: 'user2' },
                { label: '王五', value: 'user3' },
                { label: '赵六', value: 'user4' },
              ]}
            />
          </Form.Item>

          <Form.Item name="priority" label="优先级" initialValue="medium">
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default TaskBoardPage;
