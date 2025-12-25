import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Typography,
  Popconfirm,
  Table,
  Tag,
  Select,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { spaceApi } from '../services/api';
import type { SpaceMember } from '../types';
import { useSpace } from '../contexts/SpaceContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SpaceSettingsPage = () => {
  const [searchParams] = useSearchParams();
  const { currentSpace, allSpaces, setCurrentSpace } = useSpace();
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  const [infoForm] = Form.useForm();
  const [memberForm] = Form.useForm();

  // 处理 URL 参数
  useEffect(() => {
    const action = searchParams.get('action');
    const spaceId = searchParams.get('spaceId');

    if (action === 'create') {
      // 创建新空间模式
      setIsCreatingSpace(true);
      setIsEditingInfo(true);
      infoForm.resetFields();
    } else if (spaceId) {
      // 查看指定空间的设置
      const targetSpace = allSpaces.find(s => s.id === spaceId);
      if (targetSpace && targetSpace.id !== currentSpace?.id) {
        setCurrentSpace(targetSpace);
      }
    }
  }, [searchParams, allSpaces, currentSpace, setCurrentSpace]);

  useEffect(() => {
    if (currentSpace && !isCreatingSpace) {
      loadMembers(currentSpace.id);
      infoForm.setFieldsValue(currentSpace);
    }
  }, [currentSpace, isCreatingSpace]);

  const loadMembers = async (spaceId: string) => {
    try {
      const response = await spaceApi.getMembers(spaceId);
      setMembers(response.data.data);
    } catch (error) {
      message.error('加载成员列表失败');
    }
  };

  const handleSaveInfo = async () => {
    try {
      const values = await infoForm.validateFields();
      setLoading(true);

      if (isCreatingSpace) {
        // 创建新空间
        const response = await spaceApi.create(values);
        message.success('空间创建成功');
        setIsCreatingSpace(false);
        setIsEditingInfo(false);

        // 设置为当前空间并刷新
        setCurrentSpace(response.data.data);
        window.location.href = '/ai_delivery/space-settings';
      } else if (currentSpace) {
        // 更新现有空间
        await spaceApi.update(currentSpace.id, values);
        message.success('空间信息更新成功');
        setIsEditingInfo(false);

        // 更新当前空间信息
        setCurrentSpace({ ...currentSpace, ...values });
      }
    } catch (error) {
      message.error(isCreatingSpace ? '创建失败' : '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    memberForm.resetFields();
    setMemberModalOpen(true);
  };

  const handleMemberSubmit = async () => {
    if (!currentSpace) return;

    try {
      const values = await memberForm.validateFields();
      setLoading(true);

      await spaceApi.addMember(currentSpace.id, values);
      message.success('成员添加成功');

      setMemberModalOpen(false);
      memberForm.resetFields();
      loadMembers(currentSpace.id);
    } catch (error) {
      message.error('添加成员失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: string) => {
    if (!currentSpace) return;

    try {
      await spaceApi.updateMemberRole(currentSpace.id, memberId, role);
      message.success('权限更新成功');
      loadMembers(currentSpace.id);
    } catch (error) {
      message.error('更新权限失败');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!currentSpace) return;

    try {
      await spaceApi.deleteMember(currentSpace.id, memberId);
      message.success('成员删除成功');
      loadMembers(currentSpace.id);
    } catch (error) {
      message.error('删除成员失败');
    }
  };

  const memberColumns = [
    {
      title: '姓名',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'userEmail',
      key: 'userEmail',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      render: (text: string) => text && <Tag>{text}</Tag>,
    },
    {
      title: '权限',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: SpaceMember) => {
        const roleMap: Record<string, { text: string; color: string }> = {
          owner: { text: '所有者', color: 'red' },
          admin: { text: '管理员', color: 'blue' },
          member: { text: '成员', color: 'default' },
        };
        const roleInfo = roleMap[role];

        return (
          <Select
            value={role}
            style={{ width: 100 }}
            onChange={(value) => handleUpdateMemberRole(record.id, value)}
            disabled={role === 'owner'} // 不能修改所有者权限
          >
            <Select.Option value="admin">
              <Tag color={roleMap.admin.color}>{roleMap.admin.text}</Tag>
            </Select.Option>
            <Select.Option value="member">
              <Tag color={roleMap.member.color}>{roleMap.member.text}</Tag>
            </Select.Option>
          </Select>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: SpaceMember) => (
        record.role !== 'owner' && ( // 不能删除所有者
          <Popconfirm
            title="确定要删除这个成员吗？"
            onConfirm={() => handleDeleteMember(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )
      ),
    },
  ];

  if (!currentSpace && !isCreatingSpace) {
    return (
      <div style={{ padding: '24px 32px', textAlign: 'center' }}>
        <Text type="secondary">请先选择一个空间</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {isCreatingSpace ? '申请新空间' : `空间设置 - ${currentSpace?.name}`}
        </Title>
      </div>

      <Card>
        {isCreatingSpace ? (
          // 创建空间表单
          <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => window.history.back()}>取消</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveInfo} loading={loading}>
                  创建空间
                </Button>
              </Space>
            </div>
            <Form form={infoForm} layout="vertical">
              <Form.Item
                label="空间名称"
                name="name"
                rules={[{ required: true, message: '请输入空间名称' }]}
              >
                <Input placeholder="请输入空间名称" />
              </Form.Item>
              <Form.Item label="空间描述" name="description">
                <TextArea rows={3} placeholder="请输入空间描述" />
              </Form.Item>
              <Form.Item
                label="KeyOnes四层级"
                name="keyones"
                extra="格式：一层级/二层级/三层级/四层级"
              >
                <Input placeholder="技术效能中心/效能架构部/CodeLink/IDECodeLink" />
              </Form.Item>
            </Form>
          </div>
        ) : (
          // 现有空间设置
          <div>
            {/* 基本信息 */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>基本信息</Title>
                {isEditingInfo ? (
                  <Space>
                    <Button onClick={() => setIsEditingInfo(false)}>取消</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveInfo} loading={loading}>
                      保存
                    </Button>
                  </Space>
                ) : (
                  <Button icon={<EditOutlined />} onClick={() => setIsEditingInfo(true)}>
                    编辑
                  </Button>
                )}
              </div>
              <Form form={infoForm} layout="vertical" disabled={!isEditingInfo}>
                <Form.Item
                  label="空间名称"
                  name="name"
                  rules={[{ required: true, message: '请输入空间名称' }]}
                >
                  <Input placeholder="请输入空间名称" />
                </Form.Item>
                <Form.Item label="空间描述" name="description">
                  <TextArea rows={3} placeholder="请输入空间描述" />
                </Form.Item>
                <Form.Item
                  label="KeyOnes四层级"
                  name="keyones"
                  extra="格式：一层级/二层级/三层级/四层级"
                >
                  <Input placeholder="技术效能中心/效能架构部/CodeLink/IDECodeLink" />
                </Form.Item>
              </Form>
            </div>

            {/* 成员与权限 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>成员与权限</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMember}>
                  邀请成员
                </Button>
              </div>
              <Table
                columns={memberColumns}
                dataSource={members}
                rowKey="id"
                pagination={false}
              />
            </div>
          </div>
        )}
      </Card>

      {/* 成员表单 */}
      <Modal
        title="邀请成员"
        open={memberModalOpen}
        onOk={handleMemberSubmit}
        onCancel={() => setMemberModalOpen(false)}
        confirmLoading={loading}
      >
        <Form form={memberForm} layout="vertical">
          <Form.Item
            label="人员姓名"
            name="userName"
            rules={[{ required: true, message: '请输入人员姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="邮箱" name="userEmail">
            <Input placeholder="example@company.com" />
          </Form.Item>
          <Form.Item label="职位" name="position">
            <Input placeholder="例如: 产品经理" />
          </Form.Item>
          <Form.Item
            label="权限"
            name="role"
            initialValue="member"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="member">成员</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default SpaceSettingsPage;




