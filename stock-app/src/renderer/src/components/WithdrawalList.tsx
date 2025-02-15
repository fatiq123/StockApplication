import React from 'react';
import { Table, Typography } from 'antd';
import { useStorage } from '../context/StorageContext';
import dayjs from 'dayjs';

const { Title } = Typography;

const WithdrawalList: React.FC = () => {
  const { withdrawalRecords } = useStorage();

  const columns = [
    {
      title: 'Customer Name',
      render: (record: any) => `${record.customerName}`,
    },
    {
      title: 'Storage Type',
      dataIndex: 'storageType',
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: 'Withdrawn Quantity',
      dataIndex: 'quantity',
    },
    {
      title: 'Withdrawal Date',
      dataIndex: 'withdrawalDate',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Bill Amount',
      dataIndex: 'billAmount',
      render: (amount: number) => `PKR ${amount}`,
    },
    {
      title: 'Payment Status',
      dataIndex: 'isPaid',
      render: (isPaid: boolean) => isPaid ? 'Paid' : 'Pending',
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>Withdrawal Records</Title>
      <Table 
        dataSource={withdrawalRecords} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default WithdrawalList;