/// <reference types="vite/client" />

interface Window {
  electron: {
    fetchStockData: (args: {
      symbol: string;
      startDate: string;
      endDate: string;
    }) => Promise<any>;
  };
}
