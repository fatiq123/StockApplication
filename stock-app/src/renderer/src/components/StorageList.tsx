import React, { useState } from 'react';
import EditStorageModal from './EditStorageModal';
import { Table, Button, Modal, InputNumber, message, Form, Radio, Space, Typography } from 'antd';
import { useStorage } from '../context/StorageContext';
import { CustomerData } from '../types/storage';
import dayjs from 'dayjs';

const { Title } = Typography;

interface WithdrawModalState {
  visible: boolean;
  customer: CustomerData | null;
}

interface StorageListProps {
  type: 'apple' | 'potato';
  onClose: () => void;
  showCompleted?: boolean;
}

const StorageList: React.FC<StorageListProps> = ({ type, onClose, showCompleted = false }) => {
  const { storageEntries, completedEntries, withdrawStorage, generateBillPDF, exportToCSV, deleteStorageEntry, updateStorageEntry } = useStorage();
  const [withdrawModal, setWithdrawModal] = useState<WithdrawModalState>({
    visible: false,
    customer: null
  });
  const [editModal, setEditModal] = useState<{ visible: boolean; customer: CustomerData | null }>({
    visible: false,
    customer: null
  });

  const handleUpdate = (id: string, updatedData: Partial<CustomerData>) => {
    updateStorageEntry(id, updatedData);
    message.success('Storage entry updated successfully');
  };

  const entries = showCompleted ? completedEntries : storageEntries;
  const filteredEntries = entries.filter(entry => entry.type === type);

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
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (quantity: number) => `${quantity} ${type === 'apple' ? 'crates' : 'sacks'}`
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      render: (date: Date) => dayjs(date).format('YYYY-MM-DD')
    },
    ...(type === 'apple' ? [{
      title: 'Truck/Container',
      dataIndex: 'truckNumber'
    }] : []),
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
          {!showCompleted && (
            <>
              <Button
                type="primary"
                onClick={() => setWithdrawModal({ visible: true, customer: record })}
              >
                Withdraw
              </Button>
              <Button
                type="primary"
                style={{ backgroundColor: '#52c41a' }}
                onClick={() => setEditModal({ visible: true, customer: record })}
              >
                Update
              </Button>
              <Button
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete Storage Entry',
                    content: 'Are you sure you want to delete this storage entry?',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk: () => {
                      deleteStorageEntry(record.id);
                      message.success('Storage entry deleted successfully');
                    }
                  });
                }}
              >
                Delete
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={() => exportToCSV(type)}>
            Export {type.charAt(0).toUpperCase() + type.slice(1)} Records
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Space>
      </div>

      <Title level={4}>{showCompleted ? 'Completed' : 'Active'} {type.charAt(0).toUpperCase() + type.slice(1)} Storage Records</Title>

      <Table
        dataSource={filteredEntries}
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
      
      <EditStorageModal
        visible={editModal.visible}
        customer={editModal.customer}
        onCancel={() => setEditModal({ visible: false, customer: null })}
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default StorageList;