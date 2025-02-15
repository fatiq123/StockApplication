// import React from 'react';
// import { Table, Button, Modal, Typography, Space } from 'antd';
// import { useStorage } from '../context/StorageContext';
// import dayjs from 'dayjs';
// import { calculateAppleBill, calculatePotatoBill } from '../utils/billing';

// const { Text } = Typography;

// interface StorageListProps {
//   onClose: () => void;
// }

// const StorageList: React.FC<StorageListProps> = ({ onClose }) => {
//   const { storageData, settings, updateStorageData } = useStorage();

//   const handleComplete = (record: any) => {
//     Modal.confirm({
//       title: 'Complete Storage',
//       content: 'Are you sure you want to complete this storage? This will calculate the final bill.',
//       onOk: () => {
//         const endDate = new Date();
//         let billResult;

//         if (record.type === 'apple') {
//           billResult = calculateAppleBill(
//             record.quantity,
//             settings.appleRate,
//             record.startDate,
//             endDate
//           );
//         } else {
//           billResult = calculatePotatoBill(
//             record.quantity,
//             settings.potatoRate,
//             record.startDate
//           );
//         }

//         const updatedRecord = {
//           ...record,
//           status: 'completed',
//           endDate,
//           billAmount: billResult.totalAmount,
//           billDetails: billResult.details,
//         };

//         updateStorageData(record.id, updatedRecord);

//         Modal.info({
//           title: 'Bill Details',
//           content: (
//             <div>
//               <Text>Total Amount: PKR {billResult.totalAmount}</Text>
//               <pre>{billResult.details}</pre>
//             </div>
//           ),
//           width: 600,
//         });
//       },
//     });
//   };

//   const columns = [
//     {
//       title: 'Name',
//       render: (record: any) => `${record.firstName} ${record.lastName}`,
//     },
//     {
//       title: 'CNIC',
//       dataIndex: 'cnic',
//     },
//     {
//       title: 'Type',
//       dataIndex: 'type',
//       render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
//     },
//     {
//       title: 'Quantity',
//       dataIndex: 'quantity',
//       render: (quantity: number, record: any) => 
//         `${quantity} ${record.type === 'apple' ? 'crates' : 'sacks'}`,
//     },
//     {
//       title: 'Start Date',
//       dataIndex: 'startDate',
//       render: (date: Date) => dayjs(date).format('YYYY-MM-DD'),
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       render: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
//     },
//     {
//       title: 'Actions',
//       render: (record: any) => (
//         <Space>
//           {record.status === 'active' && (
//             <Button onClick={() => handleComplete(record)}>
//               Complete & Generate Bill
//             </Button>
//           )}
//           {record.status === 'completed' && (
//             <Button onClick={() => {
//               Modal.info({
//                 title: 'Bill Details',
//                 content: (
//                   <div>
//                     <Text>Total Amount: PKR {record.billAmount}</Text>
//                     <pre>{record.billDetails}</pre>
//                   </div>
//                 ),
//                 width: 600,
//               });
//             }}>
//               View Bill
//             </Button>
//           )}
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ background: '#fff', borderRadius: '8px', padding: '16px' }}>
//       <Table 
//         pagination={{ 
//           pageSize: 10,
//           position: ['bottomRight']
//         }} 
//         columns={columns} 
//         dataSource={storageData}
//         rowKey="id"
//       />
//     </div>
//   );
// };

// export default StorageList;









// StorageList.tsx
import React, { useState } from 'react';
import { Table, Button, Modal, InputNumber, message, Form } from 'antd';
import { useStorage } from '../context/StorageContext';
import dayjs from 'dayjs';

const StorageList: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { storageEntries, withdrawStorage, generateBillPDF, exportToCSV } = useStorage();
  const [withdrawModal, setWithdrawModal] = useState<{ visible: boolean; customer: any }>({
    visible: false,
    customer: null
  });

  const handleWithdraw = (values: { quantity: number }) => {
    try {
      const { remainingQuantity, billAmount } = withdrawStorage(
        withdrawModal.customer.id,
        values.quantity
      );
      message.success(`Withdrawal successful. Bill amount: ${billAmount}`);
      setWithdrawModal({ visible: false, customer: null });
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Name',
      render: (record: any) => `${record.firstName} ${record.lastName}`
    },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Quantity', dataIndex: 'quantity' },
    { title: 'Start Date', render: (record: any) => dayjs(record.startDate).format('YYYY-MM-DD') },
    { title: 'Status', dataIndex: 'status' },
    {
      title: 'Actions',
      render: (record: any) => (
        <>
          <Button onClick={() => generateBillPDF(record)}>Generate Bill</Button>
          <Button 
            onClick={() => setWithdrawModal({ visible: true, customer: record })}
            disabled={record.status === 'completed'}
          >
            Withdraw
          </Button>
        </>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => exportToCSV('apple')} style={{ marginRight: 8 }}>
          Export Apple Records
        </Button>
        <Button onClick={() => exportToCSV('potato')}>
          Export Potato Records
        </Button>
      </div>

      <Table dataSource={storageEntries} columns={columns} rowKey="id" />

      <Modal
        title="Withdraw Storage"
        open={withdrawModal.visible}
        onCancel={() => setWithdrawModal({ visible: false, customer: null })}
        footer={null}
      >
        <Form onFinish={handleWithdraw}>
          <Form.Item
            name="quantity"
            label="Quantity to Withdraw"
            rules={[
              { required: true },
              {
                validator: (_, value) =>
                  value <= withdrawModal.customer?.quantity
                    ? Promise.resolve()
                    : Promise.reject('Withdrawal quantity exceeds stored quantity')
              }
            ]}
          >
            <InputNumber min={1} max={withdrawModal.customer?.quantity} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Confirm Withdrawal
          </Button>
        </Form>
      </Modal>
    </>
  );
};

export default StorageList;
