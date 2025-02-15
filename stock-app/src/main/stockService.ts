import axios from 'axios';
import moment from 'moment';

const API_KEY = process.env.ALPHAVANTAGE_API_KEY || ''; // Add your API key here
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockDataPoint {
  date: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchStockData(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<StockDataPoint[]> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: API_KEY,
        outputsize: 'full'
      }
    });

    const timeSeries = response.data['Time Series (Daily)'];
    
    if (!timeSeries) {
      throw new Error('No data received from API');
    }

    const start = moment(startDate);
    const end = moment(endDate);

    return Object.entries(timeSeries)
      .filter(([date]) => {
        const momentDate = moment(date);
        return momentDate.isBetween(start, end, 'day', '[]');
      })
      .map(([date, values]: [string, any]): StockDataPoint => ({
        date,
        symbol,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'], 10)
      }))
      .sort((a, b) => moment(b.date).unix() - moment(a.date).unix());
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}