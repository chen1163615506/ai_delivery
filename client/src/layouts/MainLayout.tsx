import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Button, List, Typography, Divider, Empty, Badge } from 'antd';
import {
  PlusOutlined,
  FolderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { taskApi } from '../services/api';
import type { Task } from '../types';

const { Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingDecisionCount, setPendingDecisionCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadTasks();
  }, []);

  // 监听路由变化，当导航到任务详情页时刷新任务列表
  useEffect(() => {
    if (location.pathname.startsWith('/tasks/')) {
      loadTasks();
    }
  }, [location.pathname]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getAll();
      setTasks(response.data.data);

      // Mock待决策数量（实际应该从后端API获取）
      setPendingDecisionCount(3);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTask = () => {
    navigate('/');
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


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={280}
        style={{
          background: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 16,
            paddingRight: 16,
            borderBottom: '1px solid #e0e0e0',
            fontWeight: 600,
            fontSize: 16,
            color: '#1677ff',
          }}
        >
          {!collapsed && <span>AI需求交付</span>}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 32, height: 32 }}
          />
        </div>

        <div style={{ padding: collapsed ? '16px 8px' : '16px', flexShrink: 0 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewTask}
            block
            style={{ marginBottom: 8 }}
          >
            {!collapsed && '新建任务'}
          </Button>
          <div style={{ position: 'relative', width: '100%', marginBottom: 8 }}>
            <Button
              icon={<AppstoreOutlined />}
              onClick={() => navigate('/my-tasks')}
              block
            >
              {!collapsed && '我的任务'}
            </Button>
            {pendingDecisionCount > 0 && !collapsed && (
              <div style={{
                position: 'absolute',
                top: '50%',
                right: 12,
                transform: 'translateY(-50%)',
              }}>
                <Badge
                  count={pendingDecisionCount}
                  styles={{
                    indicator: {
                      backgroundColor: '#ff4d4f',
                      boxShadow: '0 0 0 1px #fff',
                    }
                  }}
                />
              </div>
            )}
            {pendingDecisionCount > 0 && collapsed && (
              <div style={{
                position: 'absolute',
                top: 6,
                right: 6,
              }}>
                <Badge
                  dot
                  styles={{
                    indicator: {
                      backgroundColor: '#ff4d4f',
                      boxShadow: '0 0 0 1px #fff',
                    }
                  }}
                />
              </div>
            )}
          </div>
          <Button
            icon={<FolderOutlined />}
            onClick={() => navigate('/assets')}
            block
          >
            {!collapsed && '我的资产'}
          </Button>
        </div>

        {!collapsed && (
          <>
            <Divider style={{ margin: '0 16px' }} />
            <div
              style={{
                padding: '12px 16px',
                fontWeight: 600,
                fontSize: 14,
                color: '#000000d9',
              }}
            >
              任务列表
            </div>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '0 8px 16px 8px',
              }}
            >
              {tasks.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无任务"
                  style={{ marginTop: 40 }}
                />
              ) : (
                <List
                  loading={loading}
                  dataSource={tasks}
                  split={false}
                  renderItem={(task) => {
                    const isActive = location.pathname === `/tasks/${task.id}`;
                    return (
                      <div
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          background: isActive ? '#e6f4ff' : 'transparent',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          borderLeft: isActive ? '3px solid #1677ff' : '3px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          {getStatusIcon(task.status)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            ellipsis
                            style={{
                              display: 'block',
                              fontSize: 13,
                              color: isActive ? '#1677ff' : '#000000d9',
                            }}
                          >
                            {task.title}
                          </Text>
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </div>
          </>
        )}
      </Sider>
      <Layout>
        <Content
          style={{
            background: '#ffffff',
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;


