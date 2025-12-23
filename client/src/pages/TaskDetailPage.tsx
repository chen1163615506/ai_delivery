import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Tag,
  Spin,
  message,
  Empty,
  Button,
  Descriptions,
  Collapse,
  Space,
  Divider,
  Statistic,
  Progress,
  Anchor,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ShareAltOutlined,
  GithubOutlined,
  DatabaseOutlined,
  SettingOutlined,
  FileTextOutlined,
  WarningOutlined,
  LinkOutlined,
  RocketOutlined,
  FolderOutlined,
  FileOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { taskApi } from '../services/api';
import type { Task, Conversation, DeliveryReport, TreeNode as TreeNodeType, TodoItem } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const TaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [report, setReport] = useState<DeliveryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 提取步骤用于目录导航
  const [steps, setSteps] = useState<Array<{ id: string; title: string }>>([]);

  // 可调整宽度
  const [leftWidth, setLeftWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(60);

  // 管理导航栏悬停状态
  const [isNavHovered, setIsNavHovered] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTask();
      loadConversations();
      loadReport();
    }
  }, [taskId]);

  useEffect(() => {
    if (conversations.length > 0) {
      const uniqueSteps = conversations
        .filter((conv) => conv.step)
        .reduce((acc, conv) => {
          if (!acc.find((s) => s.title === conv.step)) {
            acc.push({ id: conv.id, title: conv.step! });
          }
          return acc;
        }, [] as Array<{ id: string; title: string }>);
      setSteps(uniqueSteps);
    }
  }, [conversations]);

  // 处理拖动调整宽度
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(leftWidth);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        // 获取容器宽度
        const containerWidth = containerRef.current.offsetWidth;

        // 计算鼠标移动的距离
        const deltaX = e.clientX - startX;

        // 计算新的宽度百分比
        const deltaPercent = (deltaX / containerWidth) * 100;
        const newWidth = startWidth + deltaPercent;

        // 限制宽度范围在30%到80%之间
        if (newWidth >= 30 && newWidth <= 80) {
          setLeftWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, startX, startWidth]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getById(taskId!);
      setTask(response.data.data);
    } catch (error) {
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await taskApi.getConversations(taskId!);
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadReport = async () => {
    try {
      const response = await taskApi.getReport(taskId!);
      setReport(response.data.data);
    } catch (error) {
      console.log('Report not available yet');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    message.success('链接已复制到剪贴板');
  };

  const handleDeploy = () => {
    message.info('部署测试环境功能开发中...');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'in_progress':
        return <SyncOutlined spin style={{ color: '#1677ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      in_progress: '进行中',
      completed: '已完成',
      failed: '失败',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, any> = {
      pending: 'warning',
      in_progress: 'processing',
      completed: 'success',
      failed: 'error',
    };
    return map[status] || 'default';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    return { low: 'success', medium: 'warning', high: 'error' }[severity];
  };

  const getSeverityText = (severity: 'low' | 'medium' | 'high') => {
    return { low: '低', medium: '中', high: '高' }[severity];
  };

  // 现代化Git仓库树节点
  const ModernGitTreeNode = ({ node, level = 0 }: { node: TreeNodeType; level?: number }) => {
    const [expanded, setExpanded] = useState(true); // Git树默认展开
    const hasChildren = node.children && node.children.length > 0;

    const getIcon = () => {
      if (node.icon === 'github') return <GithubOutlined />;
      if (hasChildren) return <FolderOutlined />;
      return <FileOutlined />;
    };

    const getStatusTag = (status?: string) => {
      if (!status) return null;
      const statusMap = {
        completed: { text: '完成', color: '#52c41a' },
        in_progress: { text: '进行中', color: '#1677ff' },
        pending: { text: '待处理', color: '#faad14' },
      };
      const s = statusMap[status as keyof typeof statusMap] || { text: status, color: '#d9d9d9' };
      return (
        <Tag
          color={s.color}
          style={{
            fontSize: 11,
            padding: '0 6px',
            lineHeight: '18px',
            border: 'none',
            borderRadius: 4,
          }}
        >
          {s.text}
        </Tag>
      );
    };

    const paddingLeft = level * 20 + 12;

    return (
      <div style={{ marginBottom: 2 }}>
        {/* 节点本身 */}
        <div
          onClick={() => hasChildren && setExpanded(!expanded)}
          style={{
            padding: '6px 12px 6px ' + paddingLeft + 'px',
            cursor: hasChildren ? 'pointer' : 'default',
            background: expanded && hasChildren ? '#f0f5ff' : 'transparent',
            borderRadius: 4,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            if (hasChildren) {
              e.currentTarget.style.background = '#fafafa';
            }
          }}
          onMouseLeave={(e) => {
            if (hasChildren) {
              e.currentTarget.style.background = expanded ? '#f0f5ff' : 'transparent';
            }
          }}
        >
          {/* 展开/收起图标 */}
          {hasChildren && (
            <span
              style={{
                display: 'inline-flex',
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                color: '#8c8c8c',
                fontSize: 10,
              }}
            >
              ▶
            </span>
          )}

          {/* 文件夹/文件图标 */}
          <span style={{ color: node.icon === 'github' ? '#262626' : '#8c8c8c', fontSize: 14, display: 'flex' }}>
            {getIcon()}
          </span>

          {/* 标题 */}
          <Text style={{ fontSize: 13, fontWeight: node.icon === 'github' ? 600 : 400 }}>
            {node.title}
          </Text>

          {/* 状态标签 */}
          {node.status && getStatusTag(node.status)}
        </div>

        {/* 子节点 */}
        {expanded && hasChildren && (
          <div>
            {node.children!.map((child) => (
              <ModernGitTreeNode key={child.key} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染树状图
  const renderTree = (treeData: TreeNodeType[]) => {
    return (
      <div style={{ background: '#f6f8fa', padding: 12, borderRadius: 6, border: '1px solid #e8e8e8' }}>
        {treeData.map((node) => (
          <ModernGitTreeNode key={node.key} node={node} level={0} />
        ))}
      </div>
    );
  };

  // 现代化树状结构组件
  const ModernTreeNode = ({ todo, level = 0 }: { todo: TodoItem; level?: number }) => {
    const [expanded, setExpanded] = useState(false);
    // 代码节点如果有 code 内容，也算作有子内容可展开
    const hasChildren = (todo.children && todo.children.length > 0) || (todo.type === 'code' && todo.code);

    const getIcon = () => {
      if (todo.type === 'code') return <CodeOutlined />;
      if (todo.type === 'file') return <FileOutlined />;
      if (todo.type === 'repo') return <GithubOutlined />;
      if (todo.status === 'completed') return <CheckCircleOutlined />;
      if (todo.status === 'in_progress') return <SyncOutlined spin />;
      return <ClockCircleOutlined />;
    };

    const getColor = () => {
      if (todo.type === 'code') return '#1890ff';
      if (todo.type === 'file') return '#8c8c8c';
      if (todo.type === 'repo') return '#262626';
      if (todo.status === 'completed') return '#52c41a';
      if (todo.status === 'in_progress') return '#1677ff';
      return '#d9d9d9';
    };

    const paddingLeft = level * 20 + 12;

    return (
      <div style={{ marginBottom: 4 }}>
        {/* 节点本身 */}
        <div
          onClick={() => hasChildren && setExpanded(!expanded)}
          style={{
            padding: '8px 12px 8px ' + paddingLeft + 'px',
            cursor: hasChildren ? 'pointer' : 'default',
            background: expanded ? '#f0f5ff' : 'transparent',
            borderRadius: 6,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (hasChildren) {
              e.currentTarget.style.background = expanded ? '#e6f0ff' : '#fafafa';
              e.currentTarget.style.borderColor = '#d9d9d9';
            }
          }}
          onMouseLeave={(e) => {
            if (hasChildren) {
              e.currentTarget.style.background = expanded ? '#f0f5ff' : 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }
          }}
        >
          {/* 展开/收起图标 */}
          {hasChildren && (
            <span
              style={{
                display: 'inline-flex',
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                color: '#8c8c8c',
                fontSize: 12,
              }}
            >
              ▶
            </span>
          )}

          {/* 状态/类型图标 */}
          <span style={{ color: getColor(), fontSize: 14, display: 'flex', alignItems: 'center' }}>
            {getIcon()}
          </span>

          {/* 内容文字 */}
          <Text
            style={{
              fontSize: 13,
              color: todo.status === 'completed' ? '#00000073' : getColor(),
              textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
              fontWeight: todo.type === 'repo' ? 600 : todo.type === 'task' ? 500 : 400,
              flex: 1,
            }}
          >
            {todo.content}
          </Text>
        </div>

        {/* 代码展示（特殊处理） */}
        {expanded && todo.type === 'code' && todo.code && (
          <div style={{ paddingLeft: paddingLeft + 24, marginTop: 8, marginBottom: 8 }}>
            <pre
              style={{
                background: '#f6f8fa',
                padding: 16,
                borderRadius: 6,
                overflow: 'auto',
                margin: 0,
                fontSize: 12,
                lineHeight: 1.6,
                border: '1px solid #e1e4e8',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {todo.code.content}
            </pre>
          </div>
        )}

        {/* 子节点 */}
        {expanded && hasChildren && todo.type !== 'code' && (
          <div style={{ marginTop: 4 }}>
            {todo.children!.map((child) => (
              <ModernTreeNode key={child.id} todo={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染TODO列表（现代化多层级树状结构）
  const renderTodos = (todos: TodoItem[]) => {
    return (
      <div style={{ padding: '8px 0' }}>
        {todos.map((todo) => (
          <ModernTreeNode key={todo.id} todo={todo} level={0} />
        ))}
      </div>
    );
  };

  // 渲染分析数据
  const renderAnalysis = (analysis: Array<{ label: string; value: string; type?: string }>) => {
    return (
      <Descriptions bordered column={2} size="small">
        {analysis.map((item, index) => (
          <Descriptions.Item key={index} label={item.label}>
            <Tag color={item.type === 'error' ? 'error' : item.type === 'warning' ? 'warning' : 'blue'}>
              {item.value}
            </Tag>
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  // 渲染进度
  const renderProgress = (progress: { current: number; total: number; message: string }) => {
    const percent = Math.round((progress.current / progress.total) * 100);
    return (
      <div style={{ padding: '16px 0' }}>
        <Progress percent={percent} status="active" />
        <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          {progress.message} ({progress.current}/{progress.total})
        </Text>
      </div>
    );
  };

  // 渲染代码块
  const renderCode = (code: { language: string; content: string; fileName?: string }) => {
    return (
      <div style={{ marginTop: 12 }}>
        {code.fileName && (
          <div style={{ background: '#f6f8fa', padding: '8px 16px', borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottom: '1px solid #e1e4e8' }}>
            <Space>
              <CodeOutlined />
              <Text code>{code.fileName}</Text>
            </Space>
          </div>
        )}
        <pre
          style={{
            background: '#f6f8fa',
            padding: 16,
            borderRadius: code.fileName ? '0 0 6px 6px' : 6,
            overflow: 'auto',
            margin: 0,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {code.content}
        </pre>
      </div>
    );
  };

  // 渲染会话内容
  const renderConversationContent = (conv: Conversation) => {
    if (conv.structuredContent) {
      const { type } = conv.structuredContent;

      switch (type) {
        case 'tree':
          return renderTree(conv.structuredContent.tree!);
        case 'todo':
          return renderTodos(conv.structuredContent.todos!);
        case 'analysis':
          return renderAnalysis(conv.structuredContent.analysis!);
        case 'progress':
          return renderProgress(conv.structuredContent.progress!);
        case 'code':
          return renderCode(conv.structuredContent.code!);
        default:
          return <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{conv.content}</Paragraph>;
      }
    }

    return <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{conv.content}</Paragraph>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="任务不存在" />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100vh', overflow: 'hidden', userSelect: isDragging ? 'none' : 'auto' }}>
      {/* 左侧：会话区域 */}
      <div
        style={{
          flex: report ? `0 0 ${leftWidth}%` : 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#fafafa',
        }}
      >
        {/* 顶部标题区 */}
        <div
          style={{
            padding: '16px 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <Tag color={getStatusColor(task.status)} icon={getStatusIcon(task.status)}>
              {getStatusText(task.status)}
            </Tag>
          </div>
          <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
            {task.title}
          </Title>
          <Text type="secondary">{task.description}</Text>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 目录导航 - 悬停展开 */}
          {steps.length > 0 && (
            <div
              onMouseEnter={() => setIsNavHovered(true)}
              onMouseLeave={() => setIsNavHovered(false)}
              style={{
                width: isNavHovered ? 160 : 48,
                background: '#fff',
                borderRight: '1px solid #f0f0f0',
                overflowY: isNavHovered ? 'auto' : 'hidden',
                overflowX: 'hidden',
                padding: isNavHovered ? '16px 0' : '16px 0',
                transition: 'width 0.3s ease',
                position: 'relative',
              }}
            >
              <div
                style={{
                  padding: isNavHovered ? '0 16px 12px' : '0 12px 12px',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#00000073',
                  whiteSpace: 'nowrap',
                  textAlign: isNavHovered ? 'left' : 'center',
                  transition: 'all 0.3s',
                }}
              >
                {isNavHovered ? '执行步骤' : '📋'}
              </div>
              {isNavHovered && (
                <Anchor
                  affix={false}
                  offsetTop={0}
                  getContainer={() => conversationContainerRef.current || window}
                  items={steps.map((step) => ({
                    key: step.id,
                    href: `#${step.id}`,
                    title: <Text style={{ fontSize: 12 }}>{step.title}</Text>,
                  }))}
                />
              )}
            </div>
          )}

          {/* 会话内容区 */}
          <div ref={conversationContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {conversations.length === 0 ? (
              <Empty description="暂无会话记录" />
            ) : (
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {conversations.map((conv) => (
                  <div key={conv.id} id={conv.id} style={{ marginBottom: 32 }}>
                    {conv.role === 'user' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: 8,
                            background: '#1677ff',
                            color: '#fff',
                          }}
                        >
                          <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#fff' }}>
                            {conv.content}
                          </Paragraph>
                        </div>
                      </div>
                    ) : (
                      <Card
                        size="small"
                        title={
                          <Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(conv.createdAt).toLocaleTimeString('zh-CN')}
                            </Text>
                            {conv.step && (
                              <Tag color="blue" style={{ fontSize: 11 }}>
                                {conv.step}
                              </Tag>
                            )}
                          </Space>
                        }
                        style={{ marginBottom: 16 }}
                      >
                        {renderConversationContent(conv)}
                      </Card>
                    )}
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 拖动分隔条 */}
      {(task.status === 'pending_confirm' || task.status === 'completed') && report && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: 5,
            cursor: 'col-resize',
            background: isDragging ? '#1677ff' : '#f0f0f0',
            transition: isDragging ? 'none' : 'background 0.2s',
            position: 'relative',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.background = '#d9d9d9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.background = '#f0f0f0';
            }
          }}
        />
      )}

      {/* 右侧：交付报告 */}
      {(task.status === 'pending_confirm' || task.status === 'completed') && report ? (
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              padding: '16px 24px',
              background: '#fff',
              borderBottom: '1px solid #f0f0f0',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>
                交付报告
              </Title>
              <Button type="primary" icon={<ShareAltOutlined />} onClick={handleShare}>
                分享报告
              </Button>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {/* 交付概要 */}
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <span>交付概要</span>
                </Space>
              }
              style={{ marginBottom: 24 }}
              extra={
                <Button type="primary" icon={<RocketOutlined />} onClick={handleDeploy}>
                  部署测试环境
                </Button>
              }
            >
              <Descriptions column={2} bordered>
                <Descriptions.Item label="需求名称" span={2}>
                  <Space>
                    {report.requirementUrl ? (
                      <a href={report.requirementUrl} target="_blank" rel="noopener noreferrer">
                        <Button type="link" icon={<LinkOutlined />} style={{ padding: 0 }}>
                          {report.taskTitle}
                        </Button>
                      </a>
                    ) : (
                      <Text>{report.taskTitle}</Text>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="成本">
                  <Statistic
                    value={((report.tokenConsumed || 0) / 1000000 * 27).toFixed(2)}
                    prefix="¥"
                    valueStyle={{ fontSize: 16, color: '#cf1322' }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="完成时间">
                  {new Date(report.createdAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
              </Descriptions>

              <Divider >Git仓库与MR</Divider>
              {report.mergeRequests.map((mr) => (
                <div key={mr.id} style={{ marginBottom: 12 }}>
                  <Space wrap>
                    <GithubOutlined style={{ fontSize: 16 }} />
                    {mr.gitRepoUrl ? (
                      <a href={mr.gitRepoUrl} target="_blank" rel="noopener noreferrer">
                        <Text strong style={{ color: '#1890ff' }}>{mr.gitRepoName}</Text>
                      </a>
                    ) : (
                      <Text strong>{mr.gitRepoName}</Text>
                    )}
                    <a href={mr.mrUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="small" type="link" icon={<LinkOutlined />}>
                        查看MR
                      </Button>
                    </a>
                    <Tag color={mr.status === 'merged' ? 'success' : mr.status === 'pending_cr' ? 'orange' : 'processing'}>
                      {mr.status === 'merged' ? '已合并' : mr.status === 'pending_cr' ? '待CR' : mr.status === 'open' ? '待审核' : '已关闭'}
                    </Tag>
                    {report.requirementStatus === 'ai_completed' && mr.status === 'pending_cr' && (
                      <Button size="small" type="primary" onClick={() => message.info('发起CR功能待实现')}>
                        发起CR
                      </Button>
                    )}
                  </Space>
                </div>
              ))}
            </Card>

            {/* 变更说明 */}
            <Card
              title={
                <Space>
                  <WarningOutlined />
                  <span>变更说明</span>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Collapse defaultActiveKey={['impact', 'code', 'database', 'config']} ghost>
                <Panel header={<Text strong>变更影响面分析</Text>} key="impact">
                  {report.impactAnalysis.map((impact, index) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Space>
                          <Tag color={getSeverityColor(impact.severity)}>
                            {getSeverityText(impact.severity)}
                          </Tag>
                          <Text strong>{impact.module}</Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 13 }}>{impact.description}</Text>
                        {(impact.upstreamServices || impact.downstreamServices) && (
                          <div style={{ fontSize: 12, lineHeight: '20px' }}>
                            {impact.upstreamServices && impact.upstreamServices.length > 0 && (
                              <div>
                                <Text type="secondary">上游依赖: </Text>
                                {impact.upstreamServices.map((service, idx) => (
                                  <Tag key={idx} color="blue" style={{ marginTop: 4, fontSize: 11 }}>
                                    {service}
                                  </Tag>
                                ))}
                              </div>
                            )}
                            {impact.downstreamServices && impact.downstreamServices.length > 0 && (
                              <div>
                                <Text type="secondary">下游依赖: </Text>
                                {impact.downstreamServices.map((service, idx) => (
                                  <Tag key={idx} color="cyan" style={{ marginTop: 4, fontSize: 11 }}>
                                    {service}
                                  </Tag>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Space>
                      {index < report.impactAnalysis.length - 1 && <Divider style={{ margin: '8px 0' }} />}
                    </div>
                  ))}
                </Panel>

                <Panel header={<Text strong>代码变更 ({report.codeChanges.length})</Text>} key="code">
                  {report.codeChanges.map((change) => (
                    <Card
                      key={change.id}
                      size="small"
                      style={{ marginBottom: 12 }}
                      title={
                        <Space>
                          <Tag
                            color={
                              change.changeType === 'added'
                                ? 'success'
                                : change.changeType === 'modified'
                                ? 'warning'
                                : 'error'
                            }
                          >
                            {change.changeType === 'added' ? '新增' : change.changeType === 'modified' ? '修改' : '删除'}
                          </Tag>
                          <Text strong>{change.gitRepoName}</Text>
                          <Text type="secondary">{change.filePath}</Text>
                        </Space>
                      }
                    >
                      <pre
                        style={{
                          background: '#f6f8fa',
                          padding: 12,
                          borderRadius: 4,
                          overflow: 'auto',
                          fontSize: 12,
                          lineHeight: 1.6,
                        }}
                      >
                        {change.content}
                      </pre>
                    </Card>
                  ))}
                </Panel>

                {report.databaseChanges.length > 0 && (
                  <Panel
                    header={
                      <Text strong>
                        <DatabaseOutlined /> 数据库变更 ({report.databaseChanges.length})
                      </Text>
                    }
                    key="database"
                  >
                    {report.databaseChanges.map((change) => (
                      <Card
                        key={change.id}
                        size="small"
                        style={{ marginBottom: 12 }}
                        title={
                          <Space>
                            <Tag color={change.changeType === 'DDL' ? 'blue' : 'green'}>{change.changeType}</Tag>
                            <Text>{change.description}</Text>
                          </Space>
                        }
                      >
                        <pre
                          style={{
                            background: '#f6f8fa',
                            padding: 12,
                            borderRadius: 4,
                            overflow: 'auto',
                            fontSize: 12,
                            lineHeight: 1.6,
                          }}
                        >
                          {change.sqlScript}
                        </pre>
                      </Card>
                    ))}
                  </Panel>
                )}

                {report.configChanges.length > 0 && (
                  <Panel
                    header={
                      <Text strong>
                        <SettingOutlined /> 配置变更 ({report.configChanges.length})
                      </Text>
                    }
                    key="config"
                  >
                    {report.configChanges.map((change) => (
                      <Card
                        key={change.id}
                        size="small"
                        style={{ marginBottom: 12 }}
                        title={
                          <Space>
                            <Tag color={change.configType === 'file' ? 'cyan' : 'purple'}>
                              {change.configType === 'file' ? '配置文件' : '配置平台'}
                            </Tag>
                            <Text strong>{change.configKey}</Text>
                            {change.configType === 'file' && change.filePath && (
                              <Text type="secondary">({change.filePath})</Text>
                            )}
                            {change.configType === 'platform' && change.platform && (
                              <Text type="secondary">({change.platform})</Text>
                            )}
                          </Space>
                        }
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {change.oldValue && (
                            <div>
                              <Text type="secondary">旧值: </Text>
                              <Text delete code>
                                {change.oldValue}
                              </Text>
                            </div>
                          )}
                          <div>
                            <Text type="secondary">新值: </Text>
                            <Text code style={{ color: '#52c41a' }}>
                              {change.newValue}
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    ))}
                  </Panel>
                )}
              </Collapse>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TaskDetailPage;




