export const calculateBitcoinPrice = (days, model = 'standard') => {
  const logPrice = 5.84 * Math.log10(days) - 17.01;
  const standardPrice = Math.pow(10, logPrice);

  if (model === 'conservative') {
    // Conservative model: 30% lower than the standard model
    return standardPrice * 0.7;
  }
  return standardPrice;
};

export const getDaysFromGenesis = (targetDate) => {
  const genesis = new Date('2009-01-03');
  const diffTime = targetDate - genesis;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateYearlyPrices = (
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

export const simulateWithdrawal = (
  initialBtc,
  withdrawalType,
  withdrawalAmount,
  withdrawalRate,
  usdJpy,
  startYear,
  endYear,
  model = 'standard'
) => {
  const yearlyPrices = calculateYearlyPrices(startYear, endYear, model);
  let currentBtc = initialBtc;
  const data = [];

  for (const { year, price } of yearlyPrices) {
    const btcPriceJpy = price * usdJpy;
    let withdrawalAmountJpy;

    if (withdrawalType === 'fixed') {
      withdrawalAmountJpy = withdrawalAmount;
    } else {
      withdrawalAmountJpy = currentBtc * btcPriceJpy * (withdrawalRate / 100);
    }

    // BTCでの取り崩し量 (入力が税引後のため、そのまま使用)
    const btcWithdrawn = withdrawalAmountJpy / btcPriceJpy;
    currentBtc -= btcWithdrawn;

    if (currentBtc < 0) currentBtc = 0;

    data.push({
      year,
      btcPrice: btcPriceJpy,
      withdrawalAmount: withdrawalAmountJpy,
      withdrawalRate:
        withdrawalType === 'percentage'
          ? withdrawalRate
          : (withdrawalAmountJpy / (currentBtc * btcPriceJpy)) * 100,
      remainingBtc: currentBtc,
      totalValue: currentBtc * btcPriceJpy,
    });

    if (currentBtc === 0) break;
  }

  return data;
};
