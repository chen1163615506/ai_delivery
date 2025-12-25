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
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  ApiOutlined,
  CodeOutlined,
  LayoutOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { Knowledge } from '../types';

const { Search } = Input;
const { TextArea } = Input;

const KnowledgeTab = () => {
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(null);
  const [viewingKnowledge, setViewingKnowledge] = useState<Knowledge | null>(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [form] = Form.useForm();

  // Mock数据
  const mockKnowledge: Knowledge[] = [
    {
      id: '1',
      spaceId: '1',
      title: '订单退款流程',
      category: 'business',
      content: '订单退款流程说明：\n1. 退款条件：订单完成后7天内，商品无损坏\n2. 退款金额计算：原价商品全额退款，促销商品实付金额退款\n3. 特殊情况：虚拟商品不支持退款，定制商品需人工审核',
      appliedRepos: 'all',
      tags: ['订单', '退款', '业务规则'],
      aiUsageCount: 15,
      createdBy: 'user1',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      version: 3,
    },
    {
      id: '2',
      spaceId: '1',
      title: 'RESTful API设计规范',
      category: 'technical',
      subCategory: 'api',
      content: 'API设计规范：\n1. 路径命名：使用复数名词，如 /users, /orders\n2. 状态码：200成功，201创建，400参数错误，401未授权，404不存在，500服务器错误\n3. 响应格式：{"code": 0, "message": "success", "data": {...}}',
      appliedRepos: ['1', '2'],
      tags: ['API', 'REST', '规范'],
      aiUsageCount: 42,
      createdBy: 'user1',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      version: 5,
    },
    {
      id: '3',
      spaceId: '1',
      title: 'React组件编码规范',
      category: 'technical',
      subCategory: 'code-style',
      content: 'React编码规范：\n1. 组件命名：使用PascalCase\n2. Hooks使用：必须在顶层调用，自定义Hook以use开头\n3. Props定义：使用TypeScript接口，必填属性在前\n4. 样式管理：优先使用CSS Modules',
      appliedRepos: ['2'],
      tags: ['React', 'TypeScript', '代码规范'],
      aiUsageCount: 28,
      createdBy: 'user2',
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      version: 2,
    },
  ];

  const displayKnowledge = knowledgeList.length > 0 ? knowledgeList : mockKnowledge;

  const getSubCategoryIcon = (subCategory?: string) => {
    switch (subCategory) {
      case 'api':
        return <ApiOutlined />;
      case 'code-style':
        return <CodeOutlined />;
      case 'architecture':
        return <LayoutOutlined />;
      case 'tech-stack':
        return <ToolOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getSubCategoryText = (subCategory?: string) => {
    const map: Record<string, string> = {
      api: 'API规范',
      'code-style': '代码规范',
      architecture: '架构设计',
      'tech-stack': '技术栈',
      other: '其他',
    };
    return map[subCategory || 'other'] || '其他';
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingKnowledge(null);
    setAddModalOpen(true);
  };

  const handleEdit = (knowledge: Knowledge) => {
    setEditingKnowledge(knowledge);
    form.setFieldsValue(knowledge);
    setAddModalOpen(true);
  };

  const handleView = (knowledge: Knowledge) => {
    setViewingKnowledge(knowledge);
    setViewModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      message.success(editingKnowledge ? '知识更新成功' : '知识添加成功');
      setAddModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = (knowledge: Knowledge) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除知识 "${knowledge.title}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          message.success('知识删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const filteredKnowledge = displayKnowledge.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()));
    const matchCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const columns: ColumnsType<Knowledge> = [
    {
      title: '知识标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (title: string, record: Knowledge) => (
        <Space>
          {getSubCategoryIcon(record.subCategory)}
          <span style={{ fontWeight: 500 }}>{title}</span>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string, record: Knowledge) => (
        <Space direction="vertical" size={4}>
          <Tag color={category === 'business' ? 'orange' : 'blue'}>
            {category === 'business' ? '业务知识' : '技术知识'}
          </Tag>
          {record.subCategory && (
            <span style={{ fontSize: 12, color: '#999' }}>
              {getSubCategoryText(record.subCategory)}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <>
          {tags.slice(0, 3).map((tag) => (
            <Tag key={tag} style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
          {tags.length > 3 && <Tag>+{tags.length - 3}</Tag>}
        </>
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
      title: 'AI引用次数',
      dataIndex: 'aiUsageCount',
      key: 'aiUsageCount',
      width: 120,
      align: 'center',
      render: (count: number) => <Badge count={count} showZero color="#1677ff" />,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: Knowledge) => (
        <Space size="small">
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

  return (
    <div>
      {/* 顶部操作栏 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Search
            placeholder="搜索知识标题或标签"
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
            <Select.Option value="business">业务知识</Select.Option>
            <Select.Option value="technical">技术知识</Select.Option>
          </Select>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建知识
        </Button>
      </div>

      {/* 知识列表 */}
      <Table
        columns={columns}
        dataSource={filteredKnowledge}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条知识`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '40px 0' }}>
              <p style={{ marginBottom: 16 }}>暂无知识</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                创建第一条知识
              </Button>
            </div>
          ),
        }}
      />

      {/* 添加/编辑知识弹窗 */}
      <Modal
        title={editingKnowledge ? '编辑知识' : '新建知识'}
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
            name="title"
            label="知识标题"
            rules={[{ required: true, message: '请输入知识标题' }]}
          >
            <Input placeholder="如：订单退款流程" />
          </Form.Item>

          <Form.Item
            name="category"
            label="知识分类"
            rules={[{ required: true, message: '请选择知识分类' }]}
          >
            <Select placeholder="请选择分类">
              <Select.Option value="business">业务知识</Select.Option>
              <Select.Option value="technical">技术知识</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.category !== currentValues.category
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('category') === 'technical' ? (
                <Form.Item name="subCategory" label="技术子分类">
                  <Select placeholder="请选择子分类">
                    <Select.Option value="api">API规范</Select.Option>
                    <Select.Option value="code-style">代码规范</Select.Option>
                    <Select.Option value="architecture">架构设计</Select.Option>
                    <Select.Option value="tech-stack">技术栈</Select.Option>
                    <Select.Option value="other">其他</Select.Option>
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="content"
            label="知识内容"
            rules={[{ required: true, message: '请输入知识内容' }]}
          >
            <TextArea
              rows={8}
              placeholder="请输入知识内容，支持Markdown格式"
            />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车添加">
              <Select.Option value="API">API</Select.Option>
              <Select.Option value="数据库">数据库</Select.Option>
              <Select.Option value="部署">部署</Select.Option>
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
        </Form>
      </Modal>

      {/* 查看知识详情弹窗 */}
      <Modal
        title={viewingKnowledge?.title}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setViewModalOpen(false);
              if (viewingKnowledge) {
                handleEdit(viewingKnowledge);
              }
            }}
          >
            编辑
          </Button>,
        ]}
        width={800}
      >
        {viewingKnowledge && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={viewingKnowledge.category === 'business' ? 'orange' : 'blue'}>
                {viewingKnowledge.category === 'business' ? '业务知识' : '技术知识'}
              </Tag>
              {viewingKnowledge.subCategory && (
                <Tag>{getSubCategoryText(viewingKnowledge.subCategory)}</Tag>
              )}
              <Tag color="green">
                {viewingKnowledge.appliedRepos === 'all'
                  ? '所有仓库'
                  : `${viewingKnowledge.appliedRepos.length}个仓库`}
              </Tag>
            </Space>
            <div style={{ marginBottom: 16 }}>
              {viewingKnowledge.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <div
              style={{
                whiteSpace: 'pre-wrap',
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                minHeight: 200,
              }}
            >
              {viewingKnowledge.content}
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
              <Space split="|">
                <span>AI引用次数: {viewingKnowledge.aiUsageCount}</span>
                <span>版本: v{viewingKnowledge.version}</span>
                <span>创建人: {viewingKnowledge.createdBy}</span>
                <span>
                  更新时间: {new Date(viewingKnowledge.updatedAt).toLocaleString('zh-CN')}
                </span>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeTab;
