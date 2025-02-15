import React, { useState, useEffect } from 'react';
import { validatePotatoDate } from '../utils/billing';
import { Form, Input, DatePicker, InputNumber, Button, Typography, Modal, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CustomerData } from '../types/storage';
import { useStorage } from '../context/StorageContext';
import StorageList from './StorageList';

const { Title } = Typography;

interface StorageFormProps {
    type: 'apple' | 'potato';
    onBack: () => void;
}

const StorageForm: React.FC<StorageFormProps> = ({ type, onBack }) => {
    const [form] = Form.useForm();
    const [showRecords, setShowRecords] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);
    const { settings, addStorageEntry, updateSettings } = useStorage();

    // Phone number validation: 03XX-XXXXXXX
    const validatePhone = (rule: any, value: string) => {
        if (!value) {
            return Promise.reject('Please input phone number!');
        }
        const pattern = /^03\d{2}-\d{7}$/;
        if (!pattern.test(value)) {
            return Promise.reject('Phone number must be in format: 03XX-XXXXXXX');
        }
        return Promise.resolve();
    };

    const handleSubmit = (values: any) => {
        const customerData: CustomerData = {
            id: Date.now().toString(),
            ...values,
            startDate: values.startDate.toDate(),
            status: 'active'
        };
        addStorageEntry({
            ...customerData,
            type
        });
        onBack();
    };

    // CNIC validation pattern: 12345-1234567-1
    const validateCNIC = (rule: any, value: string) => {
        if (!value) {
            return Promise.reject('Please input CNIC!');
        }
        const pattern = /^\d{5}-\d{7}-\d{1}$/;
        if (!pattern.test(value)) {
            return Promise.reject('CNIC must be in format: 12345-1234567-1');
        }
        return Promise.resolve();
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Space>
                        <Button onClick={onBack}>Back to Menu</Button>
                    </Space>
                    <Button onClick={() => setShowRecords(true)}>View Records</Button>
                    <Button icon={<SettingOutlined />} onClick={() => setShowRateModal(true)}>
                        Set Rate
                    </Button>
                </div>
                <Title level={2}>{type === 'apple' ? 'Apple' : 'Potato'} Storage Registration</Title>

                <Modal
                    title="Storage Records"
                    open={showRecords}
                    onCancel={() => setShowRecords(false)}
                    width="90%"
                    footer={null}
                >
                    <StorageList onClose={() => setShowRecords(false)} />
                </Modal>

                <div style={{ marginBottom: 24, background: '#f5f7fa', padding: 16, borderRadius: 8 }}>
                    <Title level={4}>Billing Rules:</Title>
                    {type === 'apple' ? (
                        <ul style={{ marginLeft: 26, padding: 0 }}>
                            <li>First month: Full payment required regardless of start date</li>
                            <li>Subsequent months:</li>
                            <ul>
                                <li>Days 1-3: No charge</li>
                                <li>Days 4-18: Half month charge</li>
                                <li>Days 19 onwards: Full month charge</li>
                            </ul>
                            <li>Current rate: PKR {settings.appleRate} per crate per month</li>
                        </ul>
                    ) : (
                        <ul style={{ marginLeft: 26, padding: 0 }}>
                            <li>Fixed period: January to October {dayjs().year()}</li>
                            <li>Full payment required for entire 10-month period</li>
                            <li>Early withdrawal does not affect payment</li>
                            <li>Fixed rate: PKR {settings.potatoRate} per sack for 10 months</li>
                        </ul>
                    )}
                </div>

                <Modal
                    title="Set Storage Rate"
                    open={showRateModal}
                    onCancel={() => setShowRateModal(false)}
                    footer={null}
                >
                    <Form
                        onFinish={(values) => {
                            updateSettings({
                                [type === 'apple' ? 'appleRate' : 'potatoRate']: values.rate
                            });
                            setShowRateModal(false);
                        }}
                    >
                        <Form.Item
                            name="rate"
                            label={`${type === 'apple' ? 'Apple' : 'Potato'} Rate`}
                            rules={[{ required: true }]}
                        >
                            <InputNumber min={1} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save Rate
                        </Button>
                    </Form>
                </Modal>

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
                        name="cnic"
                        label="CNIC"
                        rules={[{ validator: validateCNIC }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Phone Number"
                        rules={[{ validator: validatePhone }]}
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
                        label={`Quantity (in ${type === 'apple' ? 'crates' : 'sacks'})`}
                        rules={[{ required: true, message: 'Please input quantity!' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[{ required: true, message: 'Please select start date!' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => {
                                if (!current) return false;
                                const today = dayjs().startOf('day');
                                if (current < today) return true;

                                if (type === 'potato') {
                                    return !validatePotatoDate(current);
                                }
                                return false;
                            }}
                        />
                    </Form.Item>

                    <div style={{ marginBottom: 24 }}>
                        <Typography.Text strong>
                            Current Rate: PKR {type === 'apple' ? settings.appleRate : settings.potatoRate} per {type === 'apple' ? 'crate/month' : 'sack for 10 months'}
                        </Typography.Text>
                    </div>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default StorageForm;