import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerData, WithdrawalRecord } from '../types/storage';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';

interface StorageContextType {
  storageEntries: CustomerData[];
  completedEntries: CustomerData[];
  withdrawalRecords: WithdrawalRecord[];
  settings: {
    appleRate: number;
    potatoRate: number;
  };
  addStorageEntry: (entry: CustomerData) => void;
  updateSettings: (newSettings: { appleRate?: number; potatoRate?: number }) => void;
  exportToCSV: (type: 'apple' | 'potato') => void;
  withdrawStorage: (id: string, quantity: number, isPaid: boolean) => { remainingQuantity: number; billAmount: number };
  generateBillPDF: (customer: CustomerData) => void;
  deleteStorageEntry: (id: string) => void;
  updateStorageEntry: (id: string, updatedData: Partial<CustomerData>) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storageEntries, setStorageEntries] = useState<CustomerData[]>(() => {
    const saved = localStorage.getItem('storageEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedEntries, setCompletedEntries] = useState<CustomerData[]>(() => {
    const saved = localStorage.getItem('completedEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>(() => {
    const saved = localStorage.getItem('withdrawalRecords');
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
    localStorage.setItem('completedEntries', JSON.stringify(completedEntries));
  }, [completedEntries]);

  useEffect(() => {
    localStorage.setItem('withdrawalRecords', JSON.stringify(withdrawalRecords));
  }, [withdrawalRecords]);

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
    if (customer.type === 'apple' && customer.truckNumber) {
      doc.text(`Truck Number: ${customer.truckNumber}`, 20, 80);
    }
    doc.text(`Current Quantity: ${customer.quantity}`, 20, 90);
    doc.text(`Rate: ${customer.type === 'apple' ? settings.appleRate : settings.potatoRate}`, 20, 100);
    doc.text(`Total Amount: ${calculateBill(customer)}`, 20, 110);

    if (customer.withdrawals && customer.withdrawals.length > 0) {
      doc.text('Withdrawal History:', 20, 130);
      customer.withdrawals.forEach((withdrawal, index) => {
        const y = 140 + (index * 10);
        doc.text(`${dayjs(withdrawal.withdrawalDate).format('YYYY-MM-DD')}: ${withdrawal.quantity} units - ${withdrawal.isPaid ? 'Paid' : 'Pending'} - PKR ${withdrawal.billAmount}`, 30, y);
      });
    }

    doc.save(`${customer.firstName}_${customer.lastName}_bill.pdf`);
  };

  const withdrawStorage = (id: string, quantity: number, isPaid: boolean) => {
    const customerIndex = storageEntries.findIndex(entry => entry.id === id);
    if (customerIndex === -1) throw new Error('Customer not found');

    const customer = storageEntries[customerIndex];
    if (quantity > customer.quantity) throw new Error('Withdrawal quantity exceeds stored quantity');
    if (quantity <= 0) throw new Error('Withdrawal quantity must be positive');

    const billAmount = calculateBill(customer, quantity);
    const remainingQuantity = customer.quantity - quantity;

    const withdrawalRecord: WithdrawalRecord = {
      id: Date.now().toString(),
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      storageType: customer.type,
      quantity,
      withdrawalDate: new Date(),
      billAmount,
      isPaid
    };

    setWithdrawalRecords(prev => [...prev, withdrawalRecord]);

    if (remainingQuantity === 0) {
      setCompletedEntries(prev => [...prev, { ...customer, status: 'completed' }]);
      setStorageEntries(entries => entries.filter(e => e.id !== id));
    } else {
      setStorageEntries(entries => {
        const updated = [...entries];
        updated[customerIndex] = {
          ...customer,
          quantity: remainingQuantity,
          withdrawals: [...(customer.withdrawals || []), withdrawalRecord]
        };
        return updated;
      });
    }

    return { remainingQuantity, billAmount };
  };

  const deleteStorageEntry = (id: string) => {
    setStorageEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const updateStorageEntry = <T extends CustomerData>(id: string, updatedData: Partial<T>) => {
    setStorageEntries(entries => 
      entries.map(entry => 
        entry.id === id 
          ? { ...entry, ...updatedData }
          : entry
      )
    );
  };

  return (
    <StorageContext.Provider value={{
      storageEntries,
      completedEntries,
      withdrawalRecords,
      settings,
      addStorageEntry: (entry) => setStorageEntries(prev => [...prev, entry]),
      updateSettings: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings })),
      exportToCSV,
      withdrawStorage,
      generateBillPDF,
      deleteStorageEntry,
      updateStorageEntry
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