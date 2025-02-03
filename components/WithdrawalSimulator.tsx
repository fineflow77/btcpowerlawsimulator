'use client';

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

const calculateYearlyPrices = (
  startYear = 2025,
  endYear = 2050,
  model = 'standard'
) => {
  const prices = [];
  for (let year = startYear; year <= endYear; year++) {
    const date = new Date(year, 11, 31);
    const days = getDaysFromGenesis(date);
    const price = calculateBitcoinPrice(days, model);
    prices.push({
      year,
      price,
    });
  }
  return prices;
};

const WithdrawalSimulator = () => {
  const currentYear = new Date().getFullYear();
  const [initialBTC, setInitialBTC] = useState('');
  const [startYear, setStartYear] = useState(currentYear);
  const [usdToJpy, setUsdToJpy] = useState(150);
  const [yearlyWithdrawalAmount, setYearlyWithdrawalAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(20.315);
  const [withdrawalSimulationData, setWithdrawalSimulationData] =
    useState(null);
  const [model, setModel] = useState('standard');

  const calculateWithdrawal = () => {
    if (!initialBTC || initialBTC <= 0) {
      alert('初期BTC保有量を入力してください');
      return;
    }
    if (!yearlyWithdrawalAmount || yearlyWithdrawalAmount <= 0) {
      alert('年間取り崩し額を入力してください');
      return;
    }

    const endYear = startYear + 25; // 25年間のシミュレーション
    const yearlyPrices = calculateYearlyPrices(startYear, endYear, model);
    let remainingBTC = Number(initialBTC);

    const data = yearlyPrices.map(({ year, price }) => {
      const priceJPY = price * usdToJpy;
      const withdrawalAmountUSD = yearlyWithdrawalAmount / usdToJpy;
      const taxAdjustedWithdrawalUSD =
        withdrawalAmountUSD / (1 - taxRate / 100);
      const withdrawalBTC = taxAdjustedWithdrawalUSD / price;
      remainingBTC -= withdrawalBTC;
      const assetValue = remainingBTC * price;
      const withdrawalRate = (withdrawalBTC / remainingBTC) * 100;

      return {
        year,
        btcPrice: priceJPY,
        remainingBTC,
        assetValue: assetValue * usdToJpy,
        withdrawalAmountJPY: yearlyWithdrawalAmount,
        withdrawalRate,
      };
    });

    setWithdrawalSimulationData(data);
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
        <CardTitle>取り崩しシミュレーター</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Label>初期BTC保有量</Label>
            <Input
              type="number"
              value={initialBTC}
              onChange={(e) => setInitialBTC(e.target.value)}
              step="0.01"
            />
          </div>
          <div>
            <Label>取り崩し開始年</Label>
            <Input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
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
          <div>
            <Label>年間取り崩し額（税引後）</Label>
            <Input
              type="number"
              value={yearlyWithdrawalAmount}
              onChange={(e) =>
                setYearlyWithdrawalAmount(Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label>税率（%）</Label>
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
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
            onClick={calculateWithdrawal}
            disabled={!initialBTC || !yearlyWithdrawalAmount}
          >
            シミュレーション実行
          </Button>
        </div>

        {withdrawalSimulationData && (
          <>
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 text-left bg-gray-100">
                      年
                    </th>
                    <th className="border px-4 py-2 text-right bg-gray-100">
                      1BTC価格
                    </th>
                    <th className="border px-4 py-2 text-right bg-gray-100">
                      取り崩し率
                    </th>
                    <th className="border px-4 py-2 text-right bg-gray-100">
                      年間取り崩し額
                    </th>
                    <th className="border px-4 py-2 text-right bg-gray-100">
                      残存BTC
                    </th>
                    <th className="border px-4 py-2 text-right bg-gray-100">
                      資産評価額
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalSimulationData.map((data) => (
                    <tr key={data.year} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 text-left">
                        {data.year}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatJpy(data.btcPrice)}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {data.withdrawalRate.toFixed(2)}%
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatJpy(data.withdrawalAmountJPY)}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {data.remainingBTC.toFixed(4)}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatJpy(data.assetValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={withdrawalSimulationData}>
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
                      if (name === 'assetValue' || name === 'btcPrice') {
                        const label = {
                          assetValue: '資産評価額',
                          btcPrice: '1BTC価格',
                        }[name];
                        return [formatJpy(value), label];
                      } else if (name === 'remainingBTC') {
                        return [value.toFixed(3), '残存BTC'];
                      } else if (name === 'withdrawalRate') {
                        return [value.toFixed(2) + '%', '取り崩し率'];
                      }
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="btcPrice"
                    name="1BTC価格"
                    stroke="#ff7300"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="withdrawalRate"
                    name="取り崩し率"
                    stroke="#ffc658"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="remainingBTC"
                    name="残存BTC"
                    stroke="#82ca9d"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="assetValue"
                    name="資産評価額"
                    stroke="#8884d8"
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

export default WithdrawalSimulator;
