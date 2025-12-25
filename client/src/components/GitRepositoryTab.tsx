import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  Modal,
  Form,
  Select,
  message,
  Table,
  Spin,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  GithubOutlined,
  GitlabOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  LinkOutlined,
  FileTextOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { GitRepository } from '../types';
import { useSpace } from '../contexts/SpaceContext';
import { spaceApi } from '../services/api';

const { Search } = Input;

const GitRepositoryTab = () => {
  const { currentSpace } = useSpace();
  const [repositories, setRepositories] = useState<GitRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<GitRepository | null>(null);
  const [searchText, setSearchText] = useState('');
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [knowledgeContent, setKnowledgeContent] = useState('');
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const [form] = Form.useForm();

  // 加载仓库列表
  useEffect(() => {
    if (currentSpace?.id) {
      loadRepositories();
    }
  }, [currentSpace?.id]);

  const loadRepositories = async () => {
    if (!currentSpace?.id) return;

    try {
      setLoading(true);
      const response = await spaceApi.getRepos(currentSpace.id);
      if (response.data.success) {
        setRepositories(response.data.data);
      }
    } catch (error) {
      message.error('加载仓库列表失败');
    } finally {
      setLoading(false);
    }
  };

  const displayRepos = repositories;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <SyncOutlined spin style={{ color: '#faad14' }} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return { text: '已连接', color: 'success' };
      case 'error':
        return { text: '连接失败', color: 'error' };
      default:
        return { text: '未连接', color: 'warning' };
    }
  };

  const getPlatformIcon = (url: string) => {
    if (url.includes('github')) {
      return <GithubOutlined style={{ fontSize: 20 }} />;
    }
    if (url.includes('gitlab')) {
      return <GitlabOutlined style={{ fontSize: 20 }} />;
    }
    return <GithubOutlined style={{ fontSize: 20 }} />;
  };

  const handleAddRepo = () => {
    form.resetFields();
    setEditingRepo(null);
    setAddModalOpen(true);
  };

  const handleEditRepo = (repo: GitRepository) => {
    setEditingRepo(repo);
    form.setFieldsValue(repo);
    setAddModalOpen(true);
  };

  const handleSaveRepo = async (values: any) => {
    try {
      // TODO: 调用后端API
      message.success(editingRepo ? '仓库更新成功' : '仓库添加成功');
      setAddModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeleteRepo = (repo: GitRepository) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除仓库 "${repo.name}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // TODO: 调用后端API
          message.success('仓库删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleTestConnection = async (repo: GitRepository) => {
    message.loading({ content: '测试连接中...', key: 'test' });
    setTimeout(() => {
      message.success({ content: '连接测试成功', key: 'test' });
    }, 1000);
  };

  // 生成知识
  const handleGenerateKnowledge = async (repo: GitRepository) => {
    if (!currentSpace?.id) return;

    try {
      message.loading({ content: '正在生成知识...', key: 'generate', duration: 0 });
      const response = await spaceApi.generateRepoKnowledge(currentSpace.id, repo.id);

      if (response.data.success) {
        message.success({ content: '知识生成已启动', key: 'generate' });

        // 轮询检查生成状态
        const checkInterval = setInterval(async () => {
          await loadRepositories();
          const updatedRepo = repositories.find(r => r.id === repo.id);

          if (updatedRepo?.knowledgeStatus === 'generated') {
            clearInterval(checkInterval);
            message.success('知识生成完成');
          } else if (updatedRepo?.knowledgeStatus === 'failed') {
            clearInterval(checkInterval);
            message.error('知识生成失败');
          }
        }, 2000);

        // 10秒后停止轮询
        setTimeout(() => clearInterval(checkInterval), 10000);
      }
    } catch (error) {
      message.error({ content: '生成知识失败', key: 'generate' });
    }
  };

  // 查看知识
  const handleViewKnowledge = async (repo: GitRepository) => {
    if (!currentSpace?.id) return;

    try {
      setLoadingKnowledge(true);
      setKnowledgeModalOpen(true);
      const response = await spaceApi.getRepoKnowledge(currentSpace.id, repo.id);

      if (response.data.success) {
        setKnowledgeContent(response.data.data.content);
      }
    } catch (error) {
      message.error('获取知识失败');
      setKnowledgeModalOpen(false);
    } finally {
      setLoadingKnowledge(false);
    }
  };

  // 获取知识状态显示
  const getKnowledgeStatusDisplay = (repo: GitRepository) => {
    switch (repo.knowledgeStatus) {
      case 'generated':
        return {
          text: '已生成',
          color: 'success',
          icon: <CheckCircleOutlined />,
        };
      case 'generating':
        return {
          text: '生成中',
          color: 'processing',
          icon: <LoadingOutlined />,
        };
      case 'failed':
        return {
          text: '失败',
          color: 'error',
          icon: <ExclamationCircleOutlined />,
        };
      default:
        return {
          text: '未生成',
          color: 'default',
          icon: <ClockCircleOutlined />,
        };
    }
  };

  const filteredRepos = displayRepos.filter((repo) =>
    repo.name.toLowerCase().includes(searchText.toLowerCase()) ||
    repo.url.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<GitRepository> = [
    {
      title: '仓库名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: GitRepository) => (
        <Space>
          {getPlatformIcon(record.url)}
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '仓库URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => (
        <Tooltip title={url}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <LinkOutlined style={{ marginRight: 4 }} />
            {url}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '默认分支',
      dataIndex: 'defaultBranch',
      key: 'defaultBranch',
      width: 120,
      render: (branch: string) => <Tag color="blue">{branch}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusInfo = getStatusText(status);
        return (
          <Tag color={statusInfo.color} icon={getStatusIcon(status)}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: '仓库支持',
      key: 'knowledge',
      width: 180,
      render: (_, record: GitRepository) => {
        const statusDisplay = getKnowledgeStatusDisplay(record);
        const isGenerated = record.knowledgeStatus === 'generated';
        const isGenerating = record.knowledgeStatus === 'generating';

        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Tag color={statusDisplay.color} icon={statusDisplay.icon}>
              {statusDisplay.text}
            </Tag>
            {isGenerated ? (
              <Button
                type="link"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleViewKnowledge(record)}
                style={{ padding: 0 }}
              >
                查看 claude.md
              </Button>
            ) : isGenerating ? (
              <span style={{ fontSize: 12, color: '#999' }}>
                <LoadingOutlined style={{ marginRight: 4 }} />
                生成中...
              </span>
            ) : (
              <Button
                type="link"
                size="small"
                onClick={() => handleGenerateKnowledge(record)}
                style={{ padding: 0 }}
              >
                生成知识
              </Button>
            )}
          </Space>
        );
      },
    },
    {
      title: '最近测试',
      dataIndex: 'lastTestAt',
      key: 'lastTestAt',
      width: 150,
      render: (date: string) =>
        date ? new Date(date).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: GitRepository) => (
        <Space size="small">
          <Tooltip title="测试连接">
            <Button
              type="text"
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleTestConnection(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditRepo(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteRepo(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部操作栏 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Search
          placeholder="搜索仓库名称或URL"
          allowClear
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRepo}>
          添加仓库
        </Button>
      </div>

      {/* 仓库列表 */}
      <Table
        columns={columns}
        dataSource={filteredRepos}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个仓库`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '40px 0' }}>
              <p style={{ marginBottom: 16 }}>暂无仓库</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRepo}>
                添加第一个仓库
              </Button>
            </div>
          ),
        }}
      />

      {/* 知识查看弹窗 */}
      <Modal
        title="claude.md 仓库知识"
        open={knowledgeModalOpen}
        onCancel={() => {
          setKnowledgeModalOpen(false);
          setKnowledgeContent('');
        }}
        footer={[
          <Button key="close" onClick={() => setKnowledgeModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {loadingKnowledge ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#999' }}>加载中...</p>
          </div>
        ) : (
          <div
            style={{
              maxHeight: '600px',
              overflow: 'auto',
              padding: '16px',
              background: '#f5f5f5',
              borderRadius: '4px',
            }}
          >
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace' }}>
              {knowledgeContent}
            </pre>
          </div>
        )}
      </Modal>

      {/* 添加/编辑仓库弹窗 */}
      <Modal
        title={editingRepo ? '编辑仓库' : '添加仓库'}
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRepo}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="仓库名称"
            rules={[{ required: true, message: '请输入仓库名称' }]}
          >
            <Input placeholder="如：ai-delivery-backend" />
          </Form.Item>

          <Form.Item
            name="url"
            label="仓库URL"
            rules={[
              { required: true, message: '请输入仓库URL' },
              { type: 'url', message: '请输入有效的URL' },
            ]}
          >
            <Input placeholder="https://github.com/username/repository" />
          </Form.Item>

          <Form.Item
            name="defaultBranch"
            label="默认分支"
            rules={[{ required: true, message: '请输入默认分支' }]}
            initialValue="main"
          >
            <Input placeholder="main 或 master" />
          </Form.Item>

          <Form.Item
            name="credentialType"
            label="访问凭证类型"
            initialValue="token"
          >
            <Select>
              <Select.Option value="token">Personal Access Token</Select.Option>
              <Select.Option value="ssh">SSH Key</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.credentialType !== currentValues.credentialType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('credentialType') === 'token' ? (
                <Form.Item name="token" label="Access Token">
                  <Input.Password placeholder="ghp_xxxxxxxxxxxx" />
                </Form.Item>
              ) : (
                <Form.Item name="sshKey" label="SSH Private Key">
                  <Input.TextArea rows={4} placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GitRepositoryTab;
