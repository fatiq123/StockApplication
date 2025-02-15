export interface CustomerData {
    id: string;
    firstName: string;
    lastName: string;
    cnic: string;
    phoneNumber: string;
    address: string;
    quantity: number;
    startDate: Date;
    endDate?: Date;
    billAmount?: number;
    billDetails?: string;
    status: 'active' | 'completed';
  }
  
  export interface StorageSettings {
    appleRate: number;
    potatoRate: number;
  }
  
  export interface AppleStorage extends CustomerData {
    type: 'apple';
  }
  
  export interface PotatoStorage extends CustomerData {
    type: 'potato';
  }
  
  export type StorageData = AppleStorage | PotatoStorage;