import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageSettings, CustomerData, StorageData } from '../types/storage';

interface StorageContextType {
  settings: StorageSettings;
  updateSettings: (settings: StorageSettings) => void;
  storageData: StorageData[];
  addStorageEntry: (entry: StorageData) => void;
  updateStorageData: (id: string, data: StorageData) => void;
  deleteStorageEntry: (id: string) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StorageSettings>({
    appleRate: 500, // Default rate per crate per month for apples
    potatoRate: 1200 // Fixed 10-month rate per sack for potatoes
  });
  const [storageData, setStorageData] = useState<StorageData[]>([]);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('storageSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedStorageData = localStorage.getItem('storageData');
    if (savedStorageData) {
      setStorageData(JSON.parse(savedStorageData));
    }
  }, []);

  const updateSettings = (newSettings: StorageSettings) => {
    setSettings(newSettings);
    localStorage.setItem('storageSettings', JSON.stringify(newSettings));
  };

  const addStorageEntry = (entry: StorageData) => {
    const newStorageData = [...storageData, entry];
    setStorageData(newStorageData);
    localStorage.setItem('storageData', JSON.stringify(newStorageData));
  };

  const updateStorageData = (id: string, data: StorageData) => {
    const newStorageData = storageData.map(item =>
      item.id === id ? data : item
    );
    setStorageData(newStorageData);
    localStorage.setItem('storageData', JSON.stringify(newStorageData));
  };

  const deleteStorageEntry = (id: string) => {
    const newStorageData = storageData.filter(item => item.id !== id);
    setStorageData(newStorageData);
    localStorage.setItem('storageData', JSON.stringify(newStorageData));
  };

  return (
    <StorageContext.Provider value={{ 
      settings, 
      updateSettings, 
      storageData, 
      addStorageEntry, 
      updateStorageData, 
      deleteStorageEntry 
    }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};