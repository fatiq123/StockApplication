import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerData } from '../types/storage';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';

interface StorageContextType {
  storageEntries: CustomerData[];
  settings: {
    appleRate: number;
    potatoRate: number;
  };
  addStorageEntry: (entry: CustomerData) => void;
  updateSettings: (newSettings: { appleRate?: number; potatoRate?: number }) => void;
  exportToCSV: (type: 'apple' | 'potato') => void;
  withdrawStorage: (id: string, quantity: number) => { remainingQuantity: number; billAmount: number };
  generateBillPDF: (customer: CustomerData) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storageEntries, setStorageEntries] = useState<CustomerData[]>(() => {
    const saved = localStorage.getItem('storageEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('storageSettings');
    return saved ? JSON.parse(saved) : { appleRate: 0, potatoRate: 0 };
  });

  useEffect(() => {
    localStorage.setItem('storageEntries', JSON.stringify(storageEntries));
  }, [storageEntries]);

  useEffect(() => {
    localStorage.setItem('storageSettings', JSON.stringify(settings));
  }, [settings]);

  const calculateBill = (customer: CustomerData, withdrawQuantity?: number) => {
    const quantity = withdrawQuantity || customer.quantity;
    if (customer.type === 'potato') {
      return quantity * settings.potatoRate;
    } else {
      // Apple billing logic
      const startDate = dayjs(customer.startDate);
      const currentDate = dayjs();
      const dayOfMonth = startDate.date();
      let monthlyCharge = settings.appleRate * quantity;
      
      if (currentDate.month() === startDate.month()) {
        return monthlyCharge; // First month full payment
      }
      
      if (dayOfMonth <= 3) return 0;
      if (dayOfMonth <= 18) return monthlyCharge / 2;
      return monthlyCharge;
    }
  };

  const exportToCSV = (type: 'apple' | 'potato') => {
    const filteredEntries = storageEntries.filter(entry => entry.type === type);
    const headers = ['Name', 'CNIC', 'Phone', 'Address', 'Quantity', 'Start Date', 'Rate', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        `${entry.firstName} ${entry.lastName}`,
        entry.cnic,
        entry.phoneNumber,
        entry.address.replace(',', ';'),
        entry.quantity,
        dayjs(entry.startDate).format('YYYY-MM-DD'),
        type === 'apple' ? settings.appleRate : settings.potatoRate,
        entry.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_storage_${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
  };

  const generateBillPDF = async (customer: CustomerData) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text('Storage Bill', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Customer: ${customer.firstName} ${customer.lastName}`, 20, 40);
    doc.text(`CNIC: ${customer.cnic}`, 20, 50);
    doc.text(`Phone: ${customer.phoneNumber}`, 20, 60);
    doc.text(`Storage Type: ${customer.type}`, 20, 70);
    doc.text(`Quantity: ${customer.quantity}`, 20, 80);
    doc.text(`Rate: ${customer.type === 'apple' ? settings.appleRate : settings.potatoRate}`, 20, 90);
    doc.text(`Total Amount: ${calculateBill(customer)}`, 20, 100);

    doc.save(`${customer.firstName}_${customer.lastName}_bill.pdf`);
  };

  const withdrawStorage = (id: string, quantity: number) => {
    const customerIndex = storageEntries.findIndex(entry => entry.id === id);
    if (customerIndex === -1) throw new Error('Customer not found');

    const customer = storageEntries[customerIndex];
    if (quantity > customer.quantity) throw new Error('Withdrawal quantity exceeds stored quantity');

    const billAmount = calculateBill(customer, quantity);
    const remainingQuantity = customer.quantity - quantity;

    setStorageEntries(entries => {
      const updated = [...entries];
      updated[customerIndex] = {
        ...customer,
        quantity: remainingQuantity,
        status: remainingQuantity === 0 ? 'completed' : 'active'
      };
      return updated;
    });

    return { remainingQuantity, billAmount };
  };

  return (
    <StorageContext.Provider value={{
      storageEntries,
      settings,
      addStorageEntry: (entry) => setStorageEntries(prev => [...prev, entry]),
      updateSettings: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings })),
      exportToCSV,
      withdrawStorage,
      generateBillPDF
    }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used within StorageProvider');
  return context;
};