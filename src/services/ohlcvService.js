import OhlcvData from "../models/OhlcvData.js";

/*
 getTradingDaysInAPeriod - racuna broj trading dana za datu akciju (ticker) i vremenski period

ne racunamo datumski opseg tako sto oduzmemo endDate - startDate jer za neke od tih datuma nemamo podatke -
oni se smatraju non-trading days, vikendi i praznici, zato brojimo dokumente koji zadovoljavaju kriterijum da bi dobili broj trading dana,
bitno jer pre i posle opseg racunamo na osnovu broja trading dana glavnog opsega
*/
const getTradingDaysInAPeriod = async (ticker, startDate, endDate) => {
  return await OhlcvData.countDocuments({
    ticker,
    date: { $gte: startDate, $lte: endDate },
  });
};

/*
 calculateBestTradeAndMaxProfitForAPeriod - za dati period i ticker racuna najbolji trade i maksimalni moguci profit po specifikaciji zadatka
*/
const calculateBestTradeAndMaxProfitForAPeriod = async (
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

  /*
    Algoritam za best trade u datom periodu, vremenska kompleksnost O(n):
    linearno prolazimo kroz niz ohlcv entrija sortiran po datumu rastuce,
    niz je odavde zagarantovano neprazan, odrzavamo kroz svaku iteraciju
    par (date,close) (kod nas su ovo minPrice i minDate promenljive) iz istog entrija tako da par ima minimalnu close vrednost u do sad predjenom prefiksu,
    inicijalno koristimo prvi element niza 

    Ovo vazi na pocetku svake iteracije (invarijanta):    
    minPrice je minimalna cena u prefiksu niza [0,i-1] i minDate odgovara njoj (iz istog su ohlcv podatka)
    */

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

    // Updejtujemo best trade ako je trenutni profit strogo veci
    if (currentProfit > bestSingleTrade.profit) {
      bestSingleTrade = {
        buyDate: minDate,
        buyPrice: minPrice,
        sellDate: data[i].date,
        sellPrice: currentPrice,
        profit: currentProfit,
      };
    }

    // Update minimum if we find a lower price
    // updejtujemo minimum price i date da bi odrzali invarijantu
    if (currentPrice < minPrice) {
      minPrice = currentPrice;
      minDate = data[i].date;
    }
  }

  /*
  Algoritam za vrednost maksimalnog profita, vremenska kompleksnost O(n):
*/

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

/**
 * Funkcija za dati ticker i datum segment i flag "before" ili "after" racuna
 * datum segment koji ide pre ili posle main segmenta, prvo racuna broj radnih dana u main segmentu
 * onda vraca datum segment pre ili posle koji ima isti broj radnih dana kao main segment (ako takav postoji)
 * */
const findDateRangeWithSameWorkingDays = async (
  ticker,
  referenceStartDate,
  referenceEndDate,
  direction
) => {
  const targetWorkingDays = await getTradingDaysInAPeriod(
    ticker,
    referenceStartDate,
    referenceEndDate
  );

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

const findBetterPerformingStocks = async (
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

/*
analyzeProfitPotential glavna servis funkcija,

zove calculateBestTradeAndMaxProfitForAPeriod za sva 3 segmenta,
i opciono izracunavanje iz zadatka - akcije sa boljim maksimalnim profitom

*/

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
