export interface WithdrawalRecord {
  id: string;
  customerId: string;
  customerName: string;
  storageType: 'apple' | 'potato';
  quantity: number;
  withdrawalDate: Date;
  billAmount: number;
  isPaid: boolean;
}

export interface BaseCustomerData {
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
  truckNumber?: string;
  withdrawals?: WithdrawalRecord[];
}

export interface StorageSettings {
  appleRate: number;
  potatoRate: number;
}

export interface AppleStorage extends BaseCustomerData {
  type: 'apple';
}

export interface PotatoStorage extends BaseCustomerData {
  type: 'potato';
}

export type StorageData = AppleStorage | PotatoStorage;
export type CustomerData = StorageData;