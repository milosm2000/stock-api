import OhlcvData from "../models/OhlcvData.js";

export const getTradingDaysInAPeriod = async (ticker, startDate, endDate) => {
  return await OhlcvData.countDocuments({
    ticker,
    date: { $gte: startDate, $lte: endDate },
  });
};

export const calculateBestTradeAndMaxProfitForAPeriod = async (
  ticker,
  startDate,
  endDate
) => {
  const data = await OhlcvData.find({
    ticker,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  if (data.length === 0) {
    return null;
  }

  let bestSingleTrade = {
    buyDate: null,
    buyPrice: 0,
    sellDate: null,
    sellPrice: 0,
    profit: 0,
  };

  let minPrice = data[0].close;
  let minDate = data[0].date;

  for (let i = 1; i < data.length; i++) {
    const currentPrice = data[i].close;
    const currentProfit = currentPrice - minPrice;

    if (currentProfit > bestSingleTrade.profit) {
      bestSingleTrade = {
        buyDate: minDate,
        buyPrice: minPrice,
        sellDate: data[i].date,
        sellPrice: currentPrice,
        profit: currentProfit,
      };
    }

    if (currentPrice < minPrice) {
      minPrice = currentPrice;
      minDate = data[i].date;
    }
  }

  if (bestSingleTrade.buyDate === null) {
    bestSingleTrade = {
      buyDate: data[0].date,
      buyPrice: data[0].close,
      sellDate: data[0].date,
      sellPrice: data[0].close,
      profit: 0,
    };
  }

  let maxMultipleTradesProfit = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) {
      maxMultipleTradesProfit += data[i].close - data[i - 1].close;
    }
  }
  return {
    period: {
      startDate,
      endDate,
      workingDays: data.length,
    },
    bestSingleTrade,
    maxMultipleTradesProfit,
  };
};

export const findDateRangeWithSameWorkingDays = async (
  ticker,
  referenceStartDate,
  referenceEndDate,
  direction
) => {
  if (direction !== "before" && direction !== "after") {
    throw new Error("Invalid direction parameter. Must be 'before' or 'after'");
  }

  const targetWorkingDays = await getTradingDaysInAPeriod(
    ticker,
    referenceStartDate,
    referenceEndDate
  );

  if (targetWorkingDays === 0) {
    throw new Error(
      `Could not find enough trading days ${direction} the reference period`
    );
  }

  if (direction === "before") {
    const records = await OhlcvData.find({
      ticker,
      date: { $lt: referenceStartDate },
    })
      .sort({ date: -1 })
      .limit(targetWorkingDays);

    if (records.length === targetWorkingDays) {
      return {
        startDate: records[records.length - 1].date,
        endDate: records[0].date,
      };
    }
  } else {
    const records = await OhlcvData.find({
      ticker,
      date: { $gt: referenceEndDate },
    })
      .sort({ date: 1 })
      .limit(targetWorkingDays);

    if (records.length === targetWorkingDays) {
      return {
        startDate: records[0].date,
        endDate: records[records.length - 1].date,
      };
    }
  }

  throw new Error(
    `Could not find enough trading days ${direction} the reference period`
  );
};
export const findBetterPerformingStocks = async (
  originalTicker,
  startDate,
  endDate,
  originalProfit
) => {
  /*
    
    Ne izvlacimo podatke iz Stock entiteta jer api ima mogucnost brisanja iz Stocks kolekcije
    */
  const allStocks = await OhlcvData.distinct("ticker", {
    ticker: { $ne: originalTicker },
  });

  const betterStocks = [];

  for (const ticker of allStocks) {
    const analysis = await calculateBestTradeAndMaxProfitForAPeriod(
      ticker,
      startDate,
      endDate
    );
    if (analysis && analysis.maxMultipleTradesProfit > originalProfit) {
      betterStocks.push({
        ticker,
        profit: analysis.maxMultipleTradesProfit,
      });
    }
  }

  return betterStocks.sort((a, b) => b.profit - a.profit);
};

export const analyzeProfitPotential = async (ticker, startDate, endDate) => {
  const currentPeriod = await calculateBestTradeAndMaxProfitForAPeriod(
    ticker,
    startDate,
    endDate
  );

  if (!currentPeriod) {
    throw new Error("No data available for the specified period");
  }

  const previousPeriodDates = await findDateRangeWithSameWorkingDays(
    ticker,
    startDate,
    endDate,
    "before"
  );

  const nextPeriodDates = await findDateRangeWithSameWorkingDays(
    ticker,
    startDate,
    endDate,
    "after"
  );

  const [previousPeriod, nextPeriod] = await Promise.all([
    calculateBestTradeAndMaxProfitForAPeriod(
      ticker,
      previousPeriodDates.startDate,
      previousPeriodDates.endDate
    ),
    calculateBestTradeAndMaxProfitForAPeriod(
      ticker,
      nextPeriodDates.startDate,
      nextPeriodDates.endDate
    ),
  ]);

  const betterPerformingStocks = await findBetterPerformingStocks(
    ticker,
    startDate,
    endDate,
    currentPeriod?.maxMultipleTradesProfit || 0
  );

  return {
    previousPeriod,
    currentPeriod,
    nextPeriod,
    betterPerformingStocks,
  };
};
