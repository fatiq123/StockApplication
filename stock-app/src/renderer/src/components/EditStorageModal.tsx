import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Button } from 'antd';
import { CustomerData } from '../types/storage';
import dayjs from 'dayjs';

interface EditStorageModalProps {
  visible: boolean;
  customer: CustomerData | null;
  onCancel: () => void;
  onUpdate: (id: string, updatedData: Partial<CustomerData>) => void;
}

const EditStorageModal: React.FC<EditStorageModalProps> = ({
  visible,
  customer,
  onCancel,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: Omit<CustomerData, 'id' | 'status' | 'type' | 'startDate' | 'withdrawals'>) => {
    if (!customer) return;
    
    const updatedData: Partial<CustomerData> = {
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      address: values.address,
      quantity: values.quantity,
      ...(customer.type === 'apple' && { truckNumber: values.truckNumber }),
    };

    onUpdate(customer.id, updatedData);
    onCancel();
  };

  React.useEffect(() => {
    if (customer && visible) {
      form.setFieldsValue({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        quantity: customer.quantity,
        ...(customer.type === 'apple' && { truckNumber: customer.truckNumber }),
      });
    }
  }, [customer, visible, form]);

  if (!customer) return null;

  return (
    <Modal
      title="Edit Storage Entry"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please input first name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please input last name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[{ required: true, pattern: /^03\d{2}-\d{7}$/, message: 'Please enter valid phone number (03XX-XXXXXXX)' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please input address!' }]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          name="quantity"
          label={`Quantity (in ${customer.type === 'apple' ? 'crates' : 'sacks'})`}
          rules={[{ required: true, message: 'Please input quantity!' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        {customer.type === 'apple' && (
          <Form.Item
            name="truckNumber"
            label="Truck Number"
            rules={[{ required: true, message: 'Please input truck number!' }]}
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditStorageModal;