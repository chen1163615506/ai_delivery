import React, { useState } from 'react';
import { Select, Button, Divider } from 'antd';
import { UserOutlined, FolderOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { useSpace } from '../contexts/SpaceContext';
import { useNavigate } from 'react-router-dom';

const SpaceSwitcher: React.FC = () => {
  const { currentSpace, allSpaces, setCurrentSpace } = useSpace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleChange = (spaceId: string) => {
    if (spaceId === 'create-new') {
      // TODO: 打开申请空间的对话框或页面
      console.log('申请新空间');
      return;
    }

    const space = allSpaces.find(s => s.id === spaceId);
    if (space) {
      setCurrentSpace(space);
      // 切换空间后刷新页面以更新所有数据
      window.location.reload();
    }
  };

  const handleSettings = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation();
    setOpen(false); // 关闭下拉列表
    navigate(`/space-settings?spaceId=${spaceId}`);
  };

  const handleCreateSpace = () => {
    setOpen(false); // 关闭下拉列表
    navigate('/space-settings?action=create');
  };

  const options = allSpaces.map(space => ({
    value: space.id,
    label: (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {space.type === 'personal' ? <UserOutlined /> : <FolderOutlined />}
          <span>{space.name}</span>
        </div>
        <Button
          type="text"
          size="small"
          icon={<SettingOutlined />}
          onClick={(e) => handleSettings(e, space.id)}
          style={{
            marginLeft: 8,
            opacity: 0.6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
          }}
        />
      </div>
    ),
  }));

  // 获取当前空间的显示标签(不包含设置图标)
  const getCurrentSpaceLabel = () => {
    if (!currentSpace) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {currentSpace.type === 'personal' ? <UserOutlined /> : <FolderOutlined />}
        <span>{currentSpace.name}</span>
      </div>
    );
  };

  return (
    <Select
      value={currentSpace?.id}
      onChange={handleChange}
      open={open}
      onDropdownVisibleChange={setOpen}
      size="middle"
      options={options}
      placeholder="选择空间"
      style={{
        width: 240,
      }}
      optionLabelProp="value"
      labelRender={() => getCurrentSpaceLabel()}
      dropdownRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '4px 0' }} />
          <div
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#1677ff',
              fontWeight: 500,
            }}
            onClick={handleCreateSpace}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <PlusOutlined />
            <span>申请空间</span>
          </div>
        </>
      )}
    />
  );
};

export default SpaceSwitcher;







