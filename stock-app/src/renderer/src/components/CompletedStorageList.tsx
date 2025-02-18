import React, { useState } from 'react';
import { Table, Typography, Button } from 'antd';
import { useStorage } from '../context/StorageContext';
import dayjs from 'dayjs';
import BillPreview from './BillPreview';
import { CustomerData } from '@renderer/types/storage';

const { Title } = Typography;

const CompletedStorageList: React.FC = () => {
  const { completedEntries, generateBillPDF } = useStorage();
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; customer: CustomerData | null }>({
    visible: false,
    customer: null
  });

  const columns = [
    {
      title: 'Name',
      render: (record: any) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: 'Initial Quantity',
      dataIndex: 'quantity'
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Last Withdrawal',
      render: (record: any) => {
        const withdrawals = record.withdrawals || [];
        return withdrawals.length > 0
          ? dayjs(withdrawals[withdrawals.length - 1].withdrawalDate).format('YYYY-MM-DD')
          : 'N/A';
      }
    },
    {
      title: 'Actions',
      render: (record: any) => (
        <Button onClick={() => setPreviewModal({ visible: true, customer: record })}>View Bill</Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>Completed Storage Records</Title>
      <Table
        dataSource={completedEntries}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <BillPreview
        visible={previewModal.visible}
        customer={previewModal.customer}
        onClose={() => setPreviewModal({ visible: false, customer: null })}
        onPrint={() => {
          if (previewModal.customer) {
            generateBillPDF(previewModal.customer);
          }
        }}
      />
    </div>
  );
};

export default CompletedStorageList;