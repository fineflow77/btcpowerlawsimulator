import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const calculateBitcoinPrice = (days: number, model = 'standard') => {
  const logPrice = 5.84 * Math.log10(days) - 17.01;
  const standardPrice = Math.pow(10, logPrice);
  if (model === 'conservative') {
    return standardPrice * 0.7;
  }
  return standardPrice;
};

const getDaysFromGenesis = (targetDate: Date) => {
  const genesis = new Date('2009-01-03');
  const diffTime = targetDate.getTime() - genesis.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const calculateYearlyPrices = (endYear = 2040, model = 'standard', usdToJpy = 150) => {
  const prices = [];
  const currentDate = new Date();
  const startYear = currentDate.getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    const date = new Date(year, 11, 31);
    const days = getDaysFromGenesis(date);
    const priceUSD = calculateBitcoinPrice(days, model);
    const priceJPY = priceUSD * usdToJpy;
    prices.push({
      year,
      price: priceJPY,
    });
  }
  return prices;
};

const DCASimulator = () => {
  const [initialBTC, setInitialBTC] = useState(0);
  const [monthlyDCA, setMonthlyDCA] = useState('');
  const [dcaEndYear, setDcaEndYear] = useState(2040);
  const [usdToJpy, setUsdToJpy] = useState(150);
  const [simulationData, setSimulationData] = useState(null);
  const [model, setModel] = useState('standard');

  const simulate = () => {
    if (!monthlyDCA || Number(monthlyDCA) <= 0) {
      alert('月間積立額を入力してください');
      return;
    }

    const yearlyPrices = calculateYearlyPrices(2050, model, usdToJpy);
    let totalBTC = initialBTC;
    
    const data = yearlyPrices.map(({ year, price }) => {
      const yearlyDCA = year <= dcaEndYear ? Number(monthlyDCA) * 12 : 0;
      const btcBought = yearlyDCA / price;
      totalBTC += btcBought;
      const totalValue = totalBTC * price;

      return {
        year,
        btcPrice: price,
        addedBTC: btcBought,
        totalBTC,
        totalValue,
        isAccumulating: year <= dcaEndYear,
      };
    });

    setSimulationData(data);
  };

  const formatJpy = (value) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DCAシミュレーター</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Label>初期BTC保有量</Label>
            <Input
              type="number"
              value={initialBTC}
              onChange={(e) => setInitialBTC(Number(e.target.value))}
              step="0.01"
            />
          </div>
          <div>
            <Label>月間積立額（JPY）</Label>
            <Input
              type="number"
              value={monthlyDCA}
              onChange={(e) => setMonthlyDCA(e.target.value)}
            />
          </div>
          <div>
            <Label>積立終了年</Label>
            <Input
              type="number"
              value={dcaEndYear}
              onChange={(e) => setDcaEndYear(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>為替レート（1USD=JPY）</Label>
            <Input
              type="number"
              value={usdToJpy}
              onChange={(e) => setUsdToJpy(Number(e.target.value))}
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label>価格モデル</Label>
            <div className="flex flex-col space-y-1 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="priceModel"
                  value="standard"
                  checked={model === 'standard'}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-4 w-4"
                />
                <span>標準モデル</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="priceModel"
                  value="conservative"
                  checked={model === 'conservative'}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-4 w-4"
                />
                <span>保守的モデル</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Button 
            onClick={simulate}
            disabled={!monthlyDCA || Number(monthlyDCA) <= 0}
          >
            シミュレーション実行
          </Button>
        </div>

        {simulationData && (
          <>
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">年</th>
                    <th className="px-4 py-2">BTC価格（JPY）</th>
                    <th className="px-4 py-2">追加BTC</th>
                    <th className="px-4 py-2">累積BTC</th>
                    <th className="px-4 py-2">資産評価額（JPY）</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationData.map((data) => (
                    <tr key={data.year} className={data.isAccumulating ? "" : "text-gray-500"}>
                      <td className="px-4 py-2">{data.year}</td>
                      <td className="px-4 py-2">{formatJpy(data.btcPrice)}</td>
                      <td className="px-4 py-2">{data.addedBTC.toFixed(4)}</td>
                      <td className="px-4 py-2">{data.totalBTC.toFixed(4)}</td>
                      <td className="px-4 py-2">{formatJpy(data.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={formatJpy}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => value.toFixed(3)}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'totalValue' || name === 'btcPrice') {
                        const label = {
                          'totalValue': '資産評価額（JPY）',
                          'btcPrice': 'BTC価格（JPY）'
                        }[name];
                        return [formatJpy(value), label];
                      } else if (name === 'totalBTC' || name === 'addedBTC') {
                        const label = {
                          'totalBTC': '累積BTC',
                          'addedBTC': '追加BTC'
                        }[name];
                        return [value.toFixed(3), label];
                      }
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalValue"
                    name="資産評価額"
                    stroke="#8884d8"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="btcPrice"
                    name="BTC価格"
                    stroke="#ff7300"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="totalBTC"
                    name="累積BTC"
                    stroke="#82ca9d"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="addedBTC"
                    name="追加BTC"
                    stroke="#ffc658"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DCASimulator;