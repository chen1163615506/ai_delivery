import { useState } from 'react';
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
  Tabs,
  Badge,
  Rate,
  InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  SettingOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import type { AgentManual, ManualStep } from '../types';

const { Search } = Input;
const { TextArea } = Input;

const AgentManualTab = () => {
  const [myManuals, setMyManuals] = useState<AgentManual[]>([]);
  const [publicManuals, setPublicManuals] = useState<AgentManual[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<AgentManual | null>(null);
  const [viewingManual, setViewingManual] = useState<AgentManual | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('my');
  const [form] = Form.useForm();

  // Mock数据 - 我的手册
  const mockMyManuals: AgentManual[] = [
    {
      id: '1',
      spaceId: '1',
      name: '前端应用部署流程',
      description: '将React应用部署到生产环境的标准流程',
      scenario: '每次发版时，按照此流程部署前端应用到Nginx服务器',
      appliedRepos: ['2'],
      category: 'deployment',
      steps: [
        {
          order: 1,
          name: '检查代码变更',
          description: '确认代码已经合并到main分支',
          executionType: 'manual_check',
          expectedResult: 'git status显示clean',
          isRequired: true,
          needsConfirmation: true,
        },
        {
          order: 2,
          name: '执行构建',
          description: '使用npm run build构建生产版本',
          executionType: 'command',
          command: 'npm run build',
          expectedResult: 'dist目录生成成功',
          isRequired: true,
          needsConfirmation: false,
        },
        {
          order: 3,
          name: '部署到服务器',
          description: '将dist目录上传到生产服务器',
          executionType: 'command',
          command: 'scp -r dist/* user@server:/var/www/html/',
          expectedResult: '文件传输成功',
          errorHandling: '如果失败，检查SSH连接和服务器权限',
          isRequired: true,
          needsConfirmation: true,
        },
      ],
      isPublic: false,
      usageCount: 12,
      createdBy: 'user1',
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: '2',
      spaceId: '1',
      name: '数据库变更执行流程',
      description: '生产环境数据库DDL/DML变更的安全执行流程',
      scenario: '执行数据库表结构变更或数据迁移时使用',
      appliedRepos: 'all',
      category: 'database',
      steps: [
        {
          order: 1,
          name: '备份数据库',
          description: '执行数据库全量备份',
          executionType: 'command',
          command: 'mysqldump -u root -p database_name > backup_$(date +%Y%m%d).sql',
          expectedResult: '备份文件生成成功',
          isRequired: true,
          needsConfirmation: true,
        },
        {
          order: 2,
          name: '执行SQL变更',
          description: '在生产数据库执行SQL脚本',
          executionType: 'file_operation',
          fileOperation: {
            action: 'update',
            path: '/path/to/migration.sql',
          },
          expectedResult: 'SQL执行成功，无报错',
          errorHandling: '如果失败，立即从备份恢复',
          isRequired: true,
          needsConfirmation: true,
        },
        {
          order: 3,
          name: '验证变更',
          description: '检查表结构和数据是否符合预期',
          executionType: 'manual_check',
          expectedResult: '数据校验通过',
          isRequired: true,
          needsConfirmation: true,
        },
      ],
      isPublic: false,
      usageCount: 8,
      createdBy: 'user1',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  // Mock数据 - 公开市场
  const mockPublicManuals: AgentManual[] = [
    {
      id: 'pub-1',
      spaceId: 'public',
      name: 'Docker容器化部署标准流程',
      description: '通用的Docker应用容器化部署流程，适用于大多数Web应用',
      scenario: '将应用打包成Docker镜像并部署到生产环境',
      appliedRepos: 'all',
      category: 'deployment',
      steps: [
        {
          order: 1,
          name: '编写Dockerfile',
          description: '创建Dockerfile配置文件',
          executionType: 'file_operation',
          fileOperation: {
            action: 'create',
            path: 'Dockerfile',
            content: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "start"]',
          },
          isRequired: true,
          needsConfirmation: false,
        },
        {
          order: 2,
          name: '构建镜像',
          description: '使用Docker构建应用镜像',
          executionType: 'command',
          command: 'docker build -t myapp:latest .',
          expectedResult: '镜像构建成功',
          isRequired: true,
          needsConfirmation: false,
        },
        {
          order: 3,
          name: '推送到镜像仓库',
          description: '将镜像推送到Docker Hub或私有仓库',
          executionType: 'command',
          command: 'docker push myapp:latest',
          expectedResult: '镜像推送成功',
          isRequired: true,
          needsConfirmation: true,
        },
        {
          order: 4,
          name: '部署容器',
          description: '在生产环境启动容器',
          executionType: 'command',
          command: 'docker run -d -p 3000:3000 --name myapp myapp:latest',
          expectedResult: '容器启动成功',
          errorHandling: '检查端口占用和容器日志',
          isRequired: true,
          needsConfirmation: true,
        },
      ],
      isPublic: true,
      publicId: 'docker-deploy-v1',
      usageCount: 156,
      rating: 4.7,
      ratingCount: 42,
      createdBy: 'community_user',
      createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'pub-2',
      spaceId: 'public',
      name: 'CI/CD流水线配置',
      description: 'GitHub Actions自动化构建和部署流程',
      scenario: '配置自动化测试、构建和部署流水线',
      appliedRepos: 'all',
      category: 'ci_cd',
      steps: [
        {
          order: 1,
          name: '创建workflow文件',
          description: '在项目中创建GitHub Actions配置',
          executionType: 'file_operation',
          fileOperation: {
            action: 'create',
            path: '.github/workflows/deploy.yml',
          },
          isRequired: true,
          needsConfirmation: false,
        },
        {
          order: 2,
          name: '配置构建步骤',
          description: '添加测试、构建等步骤',
          executionType: 'file_operation',
          fileOperation: {
            action: 'update',
            path: '.github/workflows/deploy.yml',
          },
          isRequired: true,
          needsConfirmation: false,
        },
        {
          order: 3,
          name: '配置部署密钥',
          description: '在GitHub Settings添加部署所需的密钥',
          executionType: 'manual_check',
          expectedResult: 'SSH_PRIVATE_KEY等密钥配置完成',
          isRequired: true,
          needsConfirmation: true,
        },
      ],
      isPublic: true,
      publicId: 'cicd-github-actions-v2',
      usageCount: 203,
      rating: 4.9,
      ratingCount: 67,
      createdBy: 'devops_expert',
      createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: 'pub-3',
      spaceId: 'public',
      name: 'API接口测试自动化',
      description: '使用Postman和Newman进行API自动化测试',
      scenario: '建立完整的API测试套件，支持CI/CD集成',
      appliedRepos: 'all',
      category: 'testing',
      steps: [
        {
          order: 1,
          name: '安装Newman',
          description: '安装Postman命令行工具',
          executionType: 'command',
          command: 'npm install -g newman',
          isRequired: true,
          needsConfirmation: false,
        },
        {
          order: 2,
          name: '导出Postman集合',
          description: '从Postman导出测试集合JSON文件',
          executionType: 'manual_check',
          expectedResult: '获得collection.json文件',
          isRequired: true,
          needsConfirmation: true,
        },
        {
          order: 3,
          name: '执行测试',
          description: '运行API测试套件',
          executionType: 'command',
          command: 'newman run collection.json -e environment.json',
          expectedResult: '所有测试通过',
          errorHandling: '检查失败的测试用例和API响应',
          isRequired: true,
          needsConfirmation: false,
        },
      ],
      isPublic: true,
      publicId: 'api-testing-newman-v1',
      usageCount: 89,
      rating: 4.5,
      ratingCount: 28,
      createdBy: 'qa_specialist',
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ];

  const displayMyManuals = myManuals.length > 0 ? myManuals : mockMyManuals;
  const displayPublicManuals = publicManuals.length > 0 ? publicManuals : mockPublicManuals;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deployment':
        return <CloudUploadOutlined />;
      case 'configuration':
        return <SettingOutlined />;
      case 'testing':
        return <CheckCircleOutlined />;
      case 'database':
        return <DatabaseOutlined />;
      case 'ci_cd':
        return <CloudServerOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getCategoryText = (category: string) => {
    const map: Record<string, string> = {
      deployment: '部署',
      configuration: '配置',
      testing: '测试',
      database: '数据库',
      ci_cd: 'CI/CD',
      other: '其他',
    };
    return map[category] || '其他';
  };

  const getExecutionTypeText = (type: string) => {
    const map: Record<string, string> = {
      command: '命令执行',
      file_operation: '文件操作',
      manual_check: '人工检查',
    };
    return map[type] || type;
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingManual(null);
    setAddModalOpen(true);
  };

  const handleEdit = (manual: AgentManual) => {
    setEditingManual(manual);
    form.setFieldsValue(manual);
    setAddModalOpen(true);
  };

  const handleView = (manual: AgentManual) => {
    setViewingManual(manual);
    setViewModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      message.success(editingManual ? '手册更新成功' : '手册添加成功');
      setAddModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = (manual: AgentManual) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除手册 "${manual.name}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.success('手册删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleExecute = (manual: AgentManual) => {
    Modal.info({
      title: '执行手册',
      content: `即将执行手册："${manual.name}"，该功能将在后续版本中实现。`,
      okText: '知道了',
      width: 500,
    });
  };

  const handleCopyToMy = (manual: AgentManual) => {
    Modal.confirm({
      title: '复制手册',
      content: `确定要将手册 "${manual.name}" 复制到我的手册吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          message.success('手册复制成功');
        } catch (error) {
          message.error('复制失败');
        }
      },
    });
  };

  const handlePublish = (manual: AgentManual) => {
    Modal.confirm({
      title: '发布到公开市场',
      content: `确定要将手册 "${manual.name}" 发布到公开市场吗？发布后其他用户可以看到并使用。`,
      okText: '发布',
      cancelText: '取消',
      onOk: async () => {
        try {
          message.success('手册发布成功');
        } catch (error) {
          message.error('发布失败');
        }
      },
    });
  };

  const filteredMyManuals = displayMyManuals.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredPublicManuals = displayPublicManuals.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const myManualsColumns: ColumnsType<AgentManual> = [
    {
      title: '手册名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name: string, record: AgentManual) => (
        <Space>
          {getCategoryIcon(record.category)}
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '适用场景',
      dataIndex: 'scenario',
      key: 'scenario',
      ellipsis: true,
      render: (scenario: string) => (
        <Tooltip title={scenario}>
          <span style={{ color: '#666' }}>{scenario}</span>
        </Tooltip>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{getCategoryText(category)}</Tag>
      ),
    },
    {
      title: '步骤数',
      dataIndex: 'steps',
      key: 'steps',
      width: 90,
      align: 'center',
      render: (steps: ManualStep[]) => (
        <Badge count={steps.length} showZero color="#52c41a" />
      ),
    },
    {
      title: '应用范围',
      dataIndex: 'appliedRepos',
      key: 'appliedRepos',
      width: 120,
      render: (appliedRepos: string | string[]) => (
        <Tag color="green">
          {appliedRepos === 'all' ? '所有仓库' : `${appliedRepos.length}个仓库`}
        </Tag>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      align: 'center',
      render: (count: number) => <span style={{ color: '#1677ff' }}>{count}</span>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: AgentManual) => (
        <Space size="small">
          <Tooltip title="执行">
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecute(record)}
            />
          </Tooltip>
          <Tooltip title="查看">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="发布到市场">
            <Button
              type="text"
              size="small"
              icon={<CloudUploadOutlined />}
              onClick={() => handlePublish(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const publicManualsColumns: ColumnsType<AgentManual> = [
    {
      title: '手册名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name: string, record: AgentManual) => (
        <Space>
          {getCategoryIcon(record.category)}
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '适用场景',
      dataIndex: 'scenario',
      key: 'scenario',
      ellipsis: true,
      render: (scenario: string) => (
        <Tooltip title={scenario}>
          <span style={{ color: '#666' }}>{scenario}</span>
        </Tooltip>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{getCategoryText(category)}</Tag>
      ),
    },
    {
      title: '步骤数',
      dataIndex: 'steps',
      key: 'steps',
      width: 90,
      align: 'center',
      render: (steps: ManualStep[]) => (
        <Badge count={steps.length} showZero color="#52c41a" />
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      align: 'center',
      render: (count: number) => <span style={{ color: '#1677ff' }}>{count}</span>,
    },
    {
      title: '评分',
      key: 'rating',
      width: 140,
      render: (_, record: AgentManual) =>
        record.rating ? (
          <Space size={4}>
            <Rate disabled value={record.rating} style={{ fontSize: 14 }} />
            <span style={{ fontSize: 12, color: '#999' }}>
              ({record.ratingCount})
            </span>
          </Space>
        ) : (
          <span style={{ color: '#999' }}>暂无评分</span>
        ),
    },
    {
      title: '作者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: AgentManual) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="复制到我的手册">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyToMy(record)}
            />
          </Tooltip>
          <Tooltip title="执行">
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecute(record)}
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
        <Space>
          <Search
            placeholder="搜索手册名称或场景"
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">全部分类</Select.Option>
            <Select.Option value="deployment">部署</Select.Option>
            <Select.Option value="configuration">配置</Select.Option>
            <Select.Option value="testing">测试</Select.Option>
            <Select.Option value="database">数据库</Select.Option>
            <Select.Option value="ci_cd">CI/CD</Select.Option>
            <Select.Option value="other">其他</Select.Option>
          </Select>
        </Space>
        {activeTab === 'my' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建手册
          </Button>
        )}
      </div>

      {/* 子标签页 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'my',
            label: '我的手册',
            children: (
              <Table
                columns={myManualsColumns}
                dataSource={filteredMyManuals}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 个手册`,
                }}
                locale={{
                  emptyText: (
                    <div style={{ padding: '40px 0' }}>
                      <p style={{ marginBottom: 16 }}>暂无手册</p>
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        创建第一个手册
                      </Button>
                    </div>
                  ),
                }}
              />
            ),
          },
          {
            key: 'public',
            label: '公开市场',
            children: (
              <Table
                columns={publicManualsColumns}
                dataSource={filteredPublicManuals}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 个手册`,
                }}
                locale={{
                  emptyText: (
                    <div style={{ padding: '40px 0' }}>
                      <p>暂无公开手册</p>
                    </div>
                  ),
                }}
              />
            ),
          },
        ]}
      />

      {/* 添加/编辑手册弹窗 */}
      <Modal
        title={editingManual ? '编辑手册' : '新建手册'}
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="手册名称"
            rules={[{ required: true, message: '请输入手册名称' }]}
          >
            <Input placeholder="如：前端应用部署流程" />
          </Form.Item>

          <Form.Item
            name="description"
            label="手册描述"
            rules={[{ required: true, message: '请输入手册描述' }]}
          >
            <TextArea rows={2} placeholder="简要描述这个手册的作用" />
          </Form.Item>

          <Form.Item
            name="scenario"
            label="适用场景"
            rules={[{ required: true, message: '请输入适用场景' }]}
          >
            <TextArea rows={2} placeholder="描述在什么情况下使用这个手册" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Select.Option value="deployment">部署</Select.Option>
              <Select.Option value="configuration">配置</Select.Option>
              <Select.Option value="testing">测试</Select.Option>
              <Select.Option value="database">数据库</Select.Option>
              <Select.Option value="ci_cd">CI/CD</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="appliedRepos"
            label="应用范围"
            initialValue="all"
          >
            <Select mode="multiple" placeholder="选择应用的仓库">
              <Select.Option value="all">所有仓库</Select.Option>
              <Select.Option value="1">ai-delivery-backend</Select.Option>
              <Select.Option value="2">ai-delivery-frontend</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <p style={{ margin: 0, color: '#999', fontSize: 12 }}>
              提示：步骤配置功能将在后续版本中实现，届时可以添加具体的执行步骤。
            </p>
          </div>
        </Form>
      </Modal>

      {/* 查看手册详情弹窗 */}
      <Modal
        title={viewingManual?.name}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            关闭
          </Button>,
          viewingManual?.isPublic ? (
            <Button
              key="copy"
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => {
                setViewModalOpen(false);
                if (viewingManual) {
                  handleCopyToMy(viewingManual);
                }
              }}
            >
              复制到我的手册
            </Button>
          ) : (
            <Button
              key="edit"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setViewModalOpen(false);
                if (viewingManual) {
                  handleEdit(viewingManual);
                }
              }}
            >
              编辑
            </Button>
          ),
        ]}
        width={900}
      >
        {viewingManual && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag color="blue">{getCategoryText(viewingManual.category)}</Tag>
              <Tag color="green">
                {viewingManual.appliedRepos === 'all'
                  ? '所有仓库'
                  : `${viewingManual.appliedRepos.length}个仓库`}
              </Tag>
              <span style={{ color: '#999', fontSize: 12 }}>
                使用次数: {viewingManual.usageCount}
              </span>
              {viewingManual.rating && (
                <Space size={4}>
                  <Rate disabled value={viewingManual.rating} style={{ fontSize: 14 }} />
                  <span style={{ fontSize: 12, color: '#999' }}>
                    ({viewingManual.ratingCount})
                  </span>
                </Space>
              )}
            </Space>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>手册描述</div>
              <div style={{ color: '#666' }}>{viewingManual.description}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>适用场景</div>
              <div style={{ color: '#666' }}>{viewingManual.scenario}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 16 }}>执行步骤</div>
              {viewingManual.steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    background: '#fafafa',
                    borderRadius: 4,
                    borderLeft: '3px solid #1677ff',
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Space>
                      <Badge count={step.order} style={{ backgroundColor: '#1677ff' }} />
                      <span style={{ fontWeight: 500, fontSize: 15 }}>{step.name}</span>
                      <Tag color="cyan">{getExecutionTypeText(step.executionType)}</Tag>
                      {step.isRequired && <Tag color="red">必需</Tag>}
                      {step.needsConfirmation && <Tag color="orange">需确认</Tag>}
                    </Space>
                  </div>
                  <div style={{ color: '#666', marginBottom: 8 }}>{step.description}</div>
                  {step.command && (
                    <div
                      style={{
                        background: '#000',
                        color: '#0f0',
                        padding: '8px 12px',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    >
                      $ {step.command}
                    </div>
                  )}
                  {step.expectedResult && (
                    <div style={{ fontSize: 12, color: '#52c41a' }}>
                      ✓ 预期结果: {step.expectedResult}
                    </div>
                  )}
                  {step.errorHandling && (
                    <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
                      ⚠ 错误处理: {step.errorHandling}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
              <Space split="|">
                <span>创建人: {viewingManual.createdBy}</span>
                <span>
                  更新时间: {new Date(viewingManual.updatedAt).toLocaleString('zh-CN')}
                </span>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AgentManualTab;
