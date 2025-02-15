import React from 'react';
import { Tabs } from 'antd';
import StorageList from './StorageList';

interface StatusTabsProps {
  type: 'apple' | 'potato';
  onClose: () => void;
}

const StatusTabs: React.FC<StatusTabsProps> = ({ type, onClose }) => {
  const items = [
    {
      key: 'active',
      label: 'Active',
      children: <StorageList type={type} onClose={onClose} showCompleted={false} />
    },
    {
      key: 'completed',
      label: 'Completed',
      children: <StorageList type={type} onClose={onClose} showCompleted={true} />
    }
  ];

  return (
    <Tabs defaultActiveKey="active" items={items} />
  );
};

export default StatusTabs;