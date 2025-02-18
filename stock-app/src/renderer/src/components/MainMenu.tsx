import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Modal, InputNumber, message } from 'antd';
import appleIcon from '../assets/apple.svg';
import potatoIcon from '../assets/potato.svg';
import StorageForm from './StorageForm';
// import StorageList from './StorageList';
import { useStorage } from '../context/StorageContext';

const { Title } = Typography;

const MainMenu: React.FC = () => {
  const [showStorageForm, setShowStorageForm] = useState(false);
  const [storageType, setStorageType] = useState<'apple' | 'potato' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const { settings, updateSettings } = useStorage();

  const handleAppleClick = () => {
    if (!settings.appleRate) {
      setShowSettings(true);
      message.info('Please set the apple storage rate first');
      return;
    }
    setStorageType('apple');
    setShowStorageForm(true);
  };

  const handlePotatoClick = () => {
    setStorageType('potato');
    setShowStorageForm(true);
  };

  if (showStorageForm && storageType) {
    return <StorageForm 
      type={storageType} 
      onBack={() => setShowStorageForm(false)} 
    />;
  }

  return (
    <div style={{ 
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
        <Title className="title">
          Welcome to Stock App
        </Title>
        
        <Modal
          title="Set Apple Storage Rate"
          open={showSettings}
          onOk={() => {
            if (settings.appleRate > 0) {
              setShowSettings(false);
              message.success('Apple storage rate updated successfully');
            } else {
              message.error('Please enter a valid rate');
            }
          }}
          onCancel={() => {
            if (settings.appleRate > 0) {
              setShowSettings(false);
            } else {
              message.error('Please set a valid rate before proceeding');
            }
          }}
        >
          <div>
            <Typography.Text>Set the rate for apple storage (PKR per crate per month):</Typography.Text>
            <InputNumber
              style={{ width: '100%', marginTop: 8 }}
              value={settings.appleRate}
              onChange={(value) => updateSettings({ ...settings, appleRate: value || 0 })}
              min={1}
            />
          </div>
        </Modal>

        
        
        <div className="menu-buttons">
        <Button 
          type="primary" 
          size="large"
          className="menu-button apple-button"
          onClick={handleAppleClick}
          style={{ 
            height: '180px',
            width: '250px',
            fontSize: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#e74c3c',
            borderColor: '#c0392b'
          }}
        >
          {/* <img src={appleIcon} alt="Apple Storage" /> */}
          <img 
            src={appleIcon} 
            alt="Apple Storage" 
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              marginBottom: '8px'
            }}
          />
          <span>Apple Storage</span>
        </Button>
        <Button 
          type="primary" 
          size="large"
          className="menu-button potato-button"
          onClick={handlePotatoClick}
          style={{ 
            height: '180px',
            width: '250px',
            fontSize: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f39c12',
            borderColor: '#d35400'
          }}
        >
          {/* <img src={potatoIcon} alt="Potato Storage" /> */}
          <img 
            src={potatoIcon} 
            alt="Potato Storage" 
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              marginBottom: '8px'
            }}
          />
          <span>Potato Storage</span>
        </Button>
      </div>
    </div>
  );
};

export default MainMenu;