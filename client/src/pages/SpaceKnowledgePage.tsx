import { useState } from 'react';
import { Tabs, Typography } from 'antd';
import { DatabaseOutlined, BookOutlined, RobotOutlined } from '@ant-design/icons';
import { useSpace } from '../contexts/SpaceContext';
import GitRepositoryTab from '../components/GitRepositoryTab';
import KnowledgeTab from '../components/KnowledgeTab';
import AgentManualTab from '../components/AgentManualTab';

const { Title } = Typography;

const SpaceKnowledgePage = () => {
  const { currentSpace } = useSpace();
  const [activeTab, setActiveTab] = useState('git');

  const tabItems = [
    {
      key: 'git',
      label: (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: 14,
          fontWeight: 500,
        }}>
          <DatabaseOutlined style={{ fontSize: 18, marginRight: 8 }} />
          Git仓库管理
        </span>
      ),
      children: <GitRepositoryTab />,
    },
    {
      key: 'knowledge',
      label: (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: 14,
          fontWeight: 500,
        }}>
          <BookOutlined style={{ fontSize: 18, marginRight: 8 }} />
          知识库
        </span>
      ),
      children: <KnowledgeTab />,
    },
    {
      key: 'manual',
      label: (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: 14,
          fontWeight: 500,
        }}>
          <RobotOutlined style={{ fontSize: 18, marginRight: 8 }} />
          Agent操作手册
        </span>
      ),
      children: <AgentManualTab />,
    },
  ];

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {currentSpace?.name} - 空间知识
        </Title>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default SpaceKnowledgePage;
