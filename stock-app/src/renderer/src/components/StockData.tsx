import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import * as XLSX from 'xlsx';

interface StockData {
  date: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const StockDataComponent: React.FC = () => {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null]>([null, null]);
  const { RangePicker } = DatePicker;

  const columns: ColumnsType<StockData> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Open',
      dataIndex: 'open',
      key: 'open',
      sorter: (a, b) => a.open - b.open
    },
    {
      title: 'High',
      dataIndex: 'high',
      key: 'high',
      sorter: (a, b) => a.high - b.high
    },
    {
      title: 'Low',
      dataIndex: 'low',
      key: 'low',
      sorter: (a, b) => a.low - b.low
    },
    {
      title: 'Close',
      dataIndex: 'close',
      key: 'close',
      sorter: (a, b) => a.close - b.close
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      sorter: (a, b) => a.volume - b.volume
    }
  ];

  const fetchStockData = async () => {
    if (!symbol || !dateRange[0] || !dateRange[1]) {
      return;
    }

    setLoading(true);
    try {
      const stockData = await window.electron.fetchStockData({
        symbol,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      });
      setData(stockData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Data');
    XLSX.writeFile(wb, `stock_data_${symbol}_${moment().format('YYYY-MM-DD')}.xlsx`);
  };

  return (
    <div className="stock-data-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="controls">
          <Space>
            <Input
              placeholder="Enter stock symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              style={{ width: 200 }}
            />
            <RangePicker
              onChange={(dates) => {
                setDateRange([
                  dates?.[0] || null,
                  dates?.[1] || null
                ]);
              }}
            />
            <Button type="primary" onClick={fetchStockData}>
              Fetch Data
            </Button>
            <Button onClick={exportToExcel} disabled={data.length === 0}>
              Export to Excel
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="date"
          scroll={{ x: true }}
        />
      </Space>
    </div>
  );
};

export default StockDataComponent;