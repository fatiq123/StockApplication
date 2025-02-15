import React, { useState } from 'react';
import { Table, Button, Modal, InputNumber, message, Form, Radio, Space } from 'antd';
import { useStorage } from '../context/StorageContext';
import { CustomerData } from '../types/storage';
import dayjs from 'dayjs';

interface WithdrawModalState {
  visible: boolean;
  customer: CustomerData | null;
}

const StorageList: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { storageEntries, withdrawStorage, generateBillPDF, exportToCSV } = useStorage();
  const [withdrawModal, setWithdrawModal] = useState<WithdrawModalState>({
    visible: false,
    customer: null
  });

  const handleWithdraw = (values: { quantity: number; isPaid: boolean }) => {
    try {
      if (!withdrawModal.customer) return;

      const { remainingQuantity, billAmount } = withdrawStorage(
        withdrawModal.customer.id,
        values.quantity,
        values.isPaid
      );

      message.success(
        `Withdrawal successful. Remaining quantity: ${remainingQuantity} ${
          withdrawModal.customer.type === 'apple' ? 'crates' : 'sacks'
        }, Bill amount: PKR ${billAmount}`
      );
      setWithdrawModal({ visible: false, customer: null });
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Name',
      render: (record: CustomerData) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (quantity: number, record: CustomerData) =>
        `${quantity} ${record.type === 'apple' ? 'crates' : 'sacks'}`
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Truck/Container',
      dataIndex: 'truckNumber',
      render: (text: string, record: CustomerData) =>
        record.type === 'apple' ? text || 'N/A' : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
    },
    {
      title: 'Actions',
      render: (record: CustomerData) => (
        <Space>
          <Button onClick={() => generateBillPDF(record)}>View Bill</Button>
          <Button
            type="primary"
            onClick={() => setWithdrawModal({ visible: true, customer: record })}
            disabled={record.status === 'completed'}
          >
            Withdraw
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button onClick={() => exportToCSV('apple')}>
            Export Apple Records
          </Button>
          <Button onClick={() => exportToCSV('potato')}>
            Export Potato Records
          </Button>
        </Space>
      </div>

      <Table
        dataSource={storageEntries}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Withdraw Storage - ${withdrawModal.customer ? 
          `${withdrawModal.customer.firstName} ${withdrawModal.customer.lastName}` : ''}`}
        open={withdrawModal.visible}
        onCancel={() => setWithdrawModal({ visible: false, customer: null })}
        footer={null}
      >
        <Form onFinish={handleWithdraw} layout="vertical">
          <Form.Item
            name="quantity"
            label="Quantity to Withdraw"
            rules={[
              { required: true, message: 'Please enter withdrawal quantity' },
              {
                validator: async (_, value) => {
                  if (!value || value <= 0) {
                    throw new Error('Withdrawal quantity must be positive');
                  }
                  if (!withdrawModal.customer) return;
                  if (value > withdrawModal.customer.quantity) {
                    throw new Error('Withdrawal quantity exceeds stored quantity');
                  }
                }
              }
            ]}
          >
            <InputNumber
              min={1}
              max={withdrawModal.customer?.quantity}
              style={{ width: '100%' }}
              placeholder={`Enter quantity (max: ${withdrawModal.customer?.quantity || 0})`}
            />
          </Form.Item>

          <Form.Item
            name="isPaid"
            label="Payment Status"
            initialValue={false}
            rules={[{ required: true, message: 'Please select payment status' }]}
          >
            <Radio.Group>
              <Radio value={true}>Paid</Radio>
              <Radio value={false}>Pending</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Confirm Withdrawal
              </Button>
              <Button onClick={() => setWithdrawModal({ visible: false, customer: null })}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default StorageList;