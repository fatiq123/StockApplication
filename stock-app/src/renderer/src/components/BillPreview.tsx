import React from 'react';
import { Modal, Button, Typography, Descriptions, Table, Space } from 'antd';
import { CustomerData } from '../types/storage';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BillPreviewProps {
  visible: boolean;
  customer: CustomerData | null;
  onClose: () => void;
  onPrint: () => void;
}

const BillPreview: React.FC<BillPreviewProps> = ({ visible, customer, onClose, onPrint }) => {
  if (!customer) return null;

  const withdrawalColumns = [
    {
      title: 'Date',
      dataIndex: 'withdrawalDate',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity'
    },
    {
      title: 'Bill Amount',
      dataIndex: 'billAmount',
      render: (amount: number) => `PKR ${amount}`
    },
    {
      title: 'Payment Status',
      dataIndex: 'isPaid',
      render: (isPaid: boolean) => (isPaid ? 'Paid' : 'Pending')
    }
  ];

  const totalBillAmount = (customer.withdrawals || []).reduce(
    (sum, w) => sum + w.billAmount,
    0
  );

  return (
    <Modal
      title="Bill Preview"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="print" type="primary" onClick={onPrint}>
          Print Bill
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <div style={{ padding: '20px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
          Storage Bill
        </Title>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Customer Name">
            {`${customer.firstName} ${customer.lastName}`}
          </Descriptions.Item>
          <Descriptions.Item label="Storage Type">
            {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
          </Descriptions.Item>
          <Descriptions.Item label="Start Date">
            {dayjs(customer.startDate).format('YYYY-MM-DD')}
          </Descriptions.Item>
          <Descriptions.Item label="Initial Quantity">
            {`${customer.quantity} ${customer.type === 'apple' ? 'crates' : 'sacks'}`}
          </Descriptions.Item>
          {customer.type === 'apple' && (
            <Descriptions.Item label="Truck/Container Number">
              {customer.truckNumber}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
          Withdrawal History
        </Title>

        <Table
          dataSource={customer.withdrawals || []}
          columns={withdrawalColumns}
          pagination={false}
          rowKey="id"
        />

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Text strong>Total Bill Amount: PKR {totalBillAmount}</Text>
        </div>
      </div>
    </Modal>
  );
};

export default BillPreview;