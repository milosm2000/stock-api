import { expect } from "chai";
import sinon from "sinon";

import {
  analyzeProfitPotential,
  calculateBestTradeAndMaxProfitForAPeriod,
  findDateRangeWithSameWorkingDays,
  getTradingDaysInAPeriod,
  findBetterPerformingStocks,
} from "../../src/services/ohlcvService.js";
import OhlcvData from "../../src/models/OhlcvData.js";

describe("Profit Analysis Tests", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("calculateBestTradeAndMaxProfitForAPeriod", () => {
    it("should return null for empty data", async () => {
      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.returns({
        sort: () => Promise.resolve([]),
      });

      const result = await calculateBestTradeAndMaxProfitForAPeriod(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-07")
      );

      expect(result).to.be.null;
    });

    it("should calculate best single trade and max multiple trades profit", async () => {
      const mockData = [
        { date: new Date("2020-01-01"), close: 100 },
        { date: new Date("2020-01-02"), close: 90 },
        { date: new Date("2020-01-03"), close: 120 },
        { date: new Date("2020-01-04"), close: 110 },
        { date: new Date("2020-01-05"), close: 130 },
      ];

      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.returns({
        sort: () => Promise.resolve(mockData),
      });

      const result = await calculateBestTradeAndMaxProfitForAPeriod(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-05")
      );

      expect(result.bestSingleTrade).to.deep.include({
        buyPrice: 90,
        sellPrice: 130,
        profit: 40,
      });
      expect(result.maxMultipleTradesProfit).to.equal(50);
    });

    it("should handle strictly decreasing prices", async () => {
      const mockData = [
        { date: new Date("2020-01-01"), close: 100 },
        { date: new Date("2020-01-02"), close: 90 },
        { date: new Date("2020-01-03"), close: 80 },
        { date: new Date("2020-01-04"), close: 70 },
        { date: new Date("2020-01-05"), close: 60 },
      ];

      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.returns({
        sort: () => Promise.resolve(mockData),
      });

      const result = await calculateBestTradeAndMaxProfitForAPeriod(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-05")
      );

      expect(result.bestSingleTrade).to.deep.include({
        buyPrice: 100,
        sellPrice: 100,
        profit: 0,
      });
      expect(result.maxMultipleTradesProfit).to.equal(0);
    });

    it("should handle strictly increasing prices", async () => {
      const mockData = [
        { date: new Date("2020-01-01"), close: 60 },
        { date: new Date("2020-01-02"), close: 70 },
        { date: new Date("2020-01-03"), close: 80 },
        { date: new Date("2020-01-04"), close: 90 },
        { date: new Date("2020-01-05"), close: 100 },
      ];

      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.returns({
        sort: () => Promise.resolve(mockData),
      });

      const result = await calculateBestTradeAndMaxProfitForAPeriod(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-05")
      );

      expect(result.bestSingleTrade).to.deep.include({
        buyPrice: 60,
        sellPrice: 100,
        profit: 40,
      });
      expect(result.maxMultipleTradesProfit).to.equal(40);
    });

    it("should handle multiple valleys and peaks", async () => {
      const mockData = [
        { date: new Date("2020-01-01"), close: 100 },
        { date: new Date("2020-01-02"), close: 80 }, // valley 1
        { date: new Date("2020-01-03"), close: 120 }, // peak 1
        { date: new Date("2020-01-04"), close: 70 }, // valley 2
        { date: new Date("2020-01-05"), close: 90 }, // peak 2
        { date: new Date("2020-01-06"), close: 60 }, // valley 3
        { date: new Date("2020-01-07"), close: 110 }, // peak 3
      ];

      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.returns({
        sort: () => Promise.resolve(mockData),
      });

      const result = await calculateBestTradeAndMaxProfitForAPeriod(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-07")
      );

      expect(result.bestSingleTrade).to.deep.include({
        buyPrice: 60,
        sellPrice: 110,
        profit: 50,
      });
      // Multiple trades: 80->120 (40) + 70->90 (20) + 60->110 (50) = 110
      expect(result.maxMultipleTradesProfit).to.equal(110);
    });

    it("should handle alternating prices with small changes", async () => {
      const mockData = [
        { date: new Date("2020-01-01"), close: 100 },
        { date: new Date("2020-01-02"), close: 98 },
        { date: new Date("2020-01-03"), close: 101 },
        { date: new Date("2020-01-04"), close: 97 },
        { date: new Date("2020-01-05"), close: 102 },
      ];

      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.returns({
        sort: () => Promise.resolve(mockData),
      });

      const result = await calculateBestTradeAndMaxProfitForAPeriod(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-05")
      );

      expect(result.bestSingleTrade).to.deep.include({
        buyPrice: 97,
        sellPrice: 102,
        profit: 5,
      });
      //Multiple trades: 98->101(3) + 97->102(5) = 8
      expect(result.maxMultipleTradesProfit).to.equal(8);
    });
  });

  describe("findDateRangeWithSameWorkingDays", () => {
    it("should find previous period with same number of trading days", async () => {
      sandbox.stub(OhlcvData, "countDocuments").resolves(3);

      const mockPreviousDays = [
        { date: new Date("2020-01-03") },
        { date: new Date("2020-01-02") },
        { date: new Date("2020-01-01") },
      ];

      sandbox.stub(OhlcvData, "find").returns({
        sort: () => ({
          limit: () => Promise.resolve(mockPreviousDays),
        }),
      });

      const result = await findDateRangeWithSameWorkingDays(
        "AAPL",
        new Date("2020-01-06"),
        new Date("2020-01-08"),
        "before"
      );

      expect(result).to.deep.equal({
        startDate: new Date("2020-01-01"),
        endDate: new Date("2020-01-03"),
      });
    });

    it("should find next period with same number of trading days", async () => {
      sandbox.stub(OhlcvData, "countDocuments").resolves(3);

      const mockNextDays = [
        { date: new Date("2020-01-09") },
        { date: new Date("2020-01-10") },
        { date: new Date("2020-01-13") },
      ];

      sandbox.stub(OhlcvData, "find").returns({
        sort: () => ({
          limit: () => Promise.resolve(mockNextDays),
        }),
      });

      const result = await findDateRangeWithSameWorkingDays(
        "AAPL",
        new Date("2020-01-06"),
        new Date("2020-01-08"),
        "after"
      );

      expect(result).to.deep.equal({
        startDate: new Date("2020-01-09"),
        endDate: new Date("2020-01-13"),
      });
    });

    it("should throw error if not enough trading days found before", async () => {
      sandbox.stub(OhlcvData, "countDocuments").resolves(5);
      sandbox.stub(OhlcvData, "find").returns({
        sort: () => ({
          limit: () => Promise.resolve([]),
        }),
      });

      try {
        await findDateRangeWithSameWorkingDays(
          "AAPL",
          new Date("2020-01-06"),
          new Date("2020-01-08"),
          "before"
        );
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).to.include(
          "Could not find enough trading days before"
        );
      }
    });

    it("should throw error if not enough trading days found after", async () => {
      sandbox.stub(OhlcvData, "countDocuments").resolves(5);
      sandbox.stub(OhlcvData, "find").returns({
        sort: () => ({
          limit: () => Promise.resolve([]),
        }),
      });

      try {
        await findDateRangeWithSameWorkingDays(
          "AAPL",
          new Date("2020-01-06"),
          new Date("2020-01-08"),
          "after"
        );
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).to.include(
          "Could not find enough trading days after"
        );
      }
    });

    it("should handle single-day periods correctly", async () => {
      sandbox.stub(OhlcvData, "countDocuments").resolves(1);

      const mockPreviousDay = [{ date: new Date("2020-01-03") }];

      sandbox.stub(OhlcvData, "find").returns({
        sort: () => ({
          limit: () => Promise.resolve(mockPreviousDay),
        }),
      });

      const result = await findDateRangeWithSameWorkingDays(
        "AAPL",
        new Date("2020-01-06"),
        new Date("2020-01-06"),
        "before"
      );

      expect(result).to.deep.equal({
        startDate: new Date("2020-01-03"),
        endDate: new Date("2020-01-03"),
      });
    });

    it("should handle periods with no trading days", async () => {
      sandbox.stub(OhlcvData, "countDocuments").resolves(0);

      try {
        await findDateRangeWithSameWorkingDays(
          "AAPL",
          new Date("2020-01-06"),
          new Date("2020-01-08"),
          "before"
        );
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).to.include("Could not find enough trading days");
      }
    });

    it("should correctly handle different tickers", async () => {
      sandbox.stub(OhlcvData, "countDocuments").resolves(2);

      const mockDays = [
        { date: new Date("2020-01-03") },
        { date: new Date("2020-01-02") },
      ];

      const findStub = sandbox.stub(OhlcvData, "find").returns({
        sort: () => ({
          limit: () => Promise.resolve(mockDays),
        }),
      });

      await findDateRangeWithSameWorkingDays(
        "TSLA",
        new Date("2020-01-06"),
        new Date("2020-01-07"),
        "before"
      );

      expect(findStub.firstCall.args[0].ticker).to.equal("TSLA");
    });

    it("should properly pass date criteria to database query", async () => {
      sandbox.stub(OhlcvData, "countDocuments").resolves(2);

      const mockDays = [
        { date: new Date("2020-01-03") },
        { date: new Date("2020-01-02") },
      ];

      const findStub = sandbox.stub(OhlcvData, "find").returns({
        sort: () => ({
          limit: () => Promise.resolve(mockDays),
        }),
      });

      const referenceStartDate = new Date("2020-01-06");
      await findDateRangeWithSameWorkingDays(
        "AAPL",
        referenceStartDate,
        new Date("2020-01-07"),
        "before"
      );

      expect(findStub.firstCall.args[0].date.$lt).to.deep.equal(
        referenceStartDate
      );
    });

    it("should throw error for invalid direction parameter", async () => {
      try {
        await findDateRangeWithSameWorkingDays(
          "AAPL",
          new Date("2020-01-06"),
          new Date("2020-01-08"),
          "invalid"
        );
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).to.include("Invalid direction parameter");
      }
    });
  });

  describe("analyzeProfitPotential integration", () => {
    it("should analyze all periods and find better performing stocks", async () => {
      const mockData = {
        current: [
          { date: new Date("2020-01-04"), close: 100 },
          { date: new Date("2020-01-05"), close: 113 }, // Best trade: buy at 100, sell at 113
          { date: new Date("2020-01-06"), close: 110 },
        ],
        previous: [
          { date: new Date("2020-01-01"), close: 95 },
          { date: new Date("2020-01-02"), close: 100 },
          { date: new Date("2020-01-03"), close: 98 },
        ],
        next: [
          { date: new Date("2020-01-07"), close: 102 },
          { date: new Date("2020-01-08"), close: 115 },
          { date: new Date("2020-01-09"), close: 112 },
        ],
        msft: [
          { date: new Date("2020-01-04"), close: 100 },
          { date: new Date("2020-01-05"), close: 120 },
          { date: new Date("2020-01-06"), close: 115 },
        ],
      };

      sandbox.stub(OhlcvData, "countDocuments").resolves(3);

      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.callsFake((query) => {
        if (query.ticker === "MSFT") {
          return {
            sort: () => Promise.resolve(mockData.msft),
          };
        }

        if (query.date?.$lt) {
          return {
            sort: () => ({
              limit: () => Promise.resolve(mockData.previous),
            }),
          };
        }

        if (query.date?.$gt) {
          return {
            sort: () => ({
              limit: () => Promise.resolve(mockData.next),
            }),
          };
        }

        if (query.date?.$gte && query.date?.$lte) {
          return {
            sort: () => Promise.resolve(mockData.current),
          };
        }

        return {
          sort: () => Promise.resolve(mockData.current),
        };
      });

      sandbox.stub(OhlcvData, "distinct").resolves(["MSFT"]);

      const result = await analyzeProfitPotential(
        "AAPL",
        new Date("2020-01-04"),
        new Date("2020-01-06")
      );

      expect(result.currentPeriod.bestSingleTrade.profit).to.equal(13);
      expect(result.currentPeriod.bestSingleTrade.profit).to.equal(13);
      expect(result.nextPeriod.bestSingleTrade.profit).to.equal(13);

      expect(result.betterPerformingStocks).to.deep.equal([
        { ticker: "MSFT", profit: 20 },
      ]);
    });

    it("should handle errors when no data is available", async () => {
      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.returns({
        sort: () => Promise.resolve([]),
      });

      try {
        await analyzeProfitPotential(
          "AAPL",
          new Date("2020-01-01"),
          new Date("2020-01-03")
        );
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).to.equal(
          "No data available for the specified period"
        );
      }
    });
    it("should handle case when only some periods have profitable trades", async () => {
      const mockData = {
        current: [
          { date: new Date("2020-01-04"), close: 100 },
          { date: new Date("2020-01-05"), close: 95 },
          { date: new Date("2020-01-06"), close: 90 },
        ],
        previous: [
          { date: new Date("2020-01-01"), close: 100 },
          { date: new Date("2020-01-02"), close: 95 },
          { date: new Date("2020-01-03"), close: 90 },
        ],
        next: [
          { date: new Date("2020-01-07"), close: 100 },
          { date: new Date("2020-01-08"), close: 120 },
          { date: new Date("2020-01-09"), close: 115 },
        ],
        goog: [
          { date: new Date("2020-01-04"), close: 100 },
          { date: new Date("2020-01-05"), close: 130 },
          { date: new Date("2020-01-06"), close: 125 },
        ],
      };

      sandbox.stub(OhlcvData, "countDocuments").resolves(3);

      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.callsFake((query) => {
        return {
          sort: () => {
            if (query.ticker === "GOOG") {
              return Promise.resolve(mockData.goog);
            }

            if (query.date?.$gte && query.date?.$lte) {
              //For periods that need date range
              if (query.date.$gte >= new Date("2020-01-07")) {
                return Promise.resolve(mockData.next);
              }
              if (query.date.$gte >= new Date("2020-01-04")) {
                return Promise.resolve(mockData.current);
              }
              if (query.date.$gte <= new Date("2020-01-03")) {
                return Promise.resolve(mockData.previous);
              }
            }

            if (query.date?.$lt) {
              return {
                limit: () =>
                  Promise.resolve(
                    mockData.previous.slice().sort((a, b) => b.date - a.date)
                  ),
              };
            }

            if (query.date?.$gt) {
              return {
                limit: () => Promise.resolve(mockData.next),
              };
            }

            return Promise.resolve(mockData.current);
          },
        };
      });

      sandbox.stub(OhlcvData, "distinct").resolves(["GOOG"]);

      const result = await analyzeProfitPotential(
        "AAPL",
        new Date("2020-01-04"),
        new Date("2020-01-06")
      );

      expect(result.currentPeriod.bestSingleTrade.profit).to.equal(0);
      expect(result.previousPeriod.bestSingleTrade.profit).to.equal(0);
      expect(result.nextPeriod.bestSingleTrade.profit).to.equal(20);
      expect(result.betterPerformingStocks).to.deep.equal([
        { ticker: "GOOG", profit: 30 },
      ]);
    });
    it("should handle multiple better performing stocks sorted by profit", async () => {
      const mockData = {
        current: [
          { date: new Date("2020-01-04"), close: 100 },
          { date: new Date("2020-01-05"), close: 110 },
          { date: new Date("2020-01-06"), close: 105 },
        ],
        previous: [
          { date: new Date("2020-01-01"), close: 100 },
          { date: new Date("2020-01-02"), close: 110 },
          { date: new Date("2020-01-03"), close: 105 },
        ],
        next: [
          { date: new Date("2020-01-07"), close: 100 },
          { date: new Date("2020-01-08"), close: 110 },
          { date: new Date("2020-01-09"), close: 105 },
        ],
        msft: [
          { date: new Date("2020-01-04"), close: 100 },
          { date: new Date("2020-01-05"), close: 120 },
          { date: new Date("2020-01-06"), close: 115 },
        ],
        goog: [
          { date: new Date("2020-01-04"), close: 100 },
          { date: new Date("2020-01-05"), close: 130 },
          { date: new Date("2020-01-06"), close: 125 },
        ],
        amzn: [
          { date: new Date("2020-01-04"), close: 100 },
          { date: new Date("2020-01-05"), close: 105 },
          { date: new Date("2020-01-06"), close: 102 },
        ],
      };

      sandbox.stub(OhlcvData, "countDocuments").resolves(3);
      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.callsFake((query) => {
        if (query.ticker === "MSFT")
          return { sort: () => Promise.resolve(mockData.msft) };
        if (query.ticker === "GOOG")
          return { sort: () => Promise.resolve(mockData.goog) };
        if (query.ticker === "AMZN")
          return { sort: () => Promise.resolve(mockData.amzn) };
        if (query.date?.$lt) {
          return {
            sort: () => ({ limit: () => Promise.resolve(mockData.previous) }),
          };
        }
        if (query.date?.$gt) {
          return {
            sort: () => ({ limit: () => Promise.resolve(mockData.next) }),
          };
        }
        return { sort: () => Promise.resolve(mockData.current) };
      });

      sandbox.stub(OhlcvData, "distinct").resolves(["MSFT", "GOOG", "AMZN"]);

      const result = await analyzeProfitPotential(
        "AAPL",
        new Date("2020-01-04"),
        new Date("2020-01-06")
      );

      expect(result.betterPerformingStocks).to.deep.equal([
        { ticker: "GOOG", profit: 30 },
        { ticker: "MSFT", profit: 20 },
      ]);
    });
  });

  describe("getTradingDaysInAPeriod", () => {
    it("should return correct count from countDocuments", async () => {
      const countStub = sandbox.stub(OhlcvData, "countDocuments").resolves(3);

      const result = await getTradingDaysInAPeriod(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-03")
      );

      expect(result).to.equal(3);
      expect(countStub.calledOnce).to.be.true;
      expect(countStub.firstCall.args[0]).to.deep.equal({
        ticker: "AAPL",
        date: {
          $gte: new Date("2020-01-01"),
          $lte: new Date("2020-01-03"),
        },
      });
    });

    it("should handle empty results", async () => {
      const countStub = sandbox.stub(OhlcvData, "countDocuments").resolves(0);

      const result = await getTradingDaysInAPeriod(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-03")
      );

      expect(result).to.equal(0);
    });
  });

  describe("findBetterPerformingStocks", () => {
    it("should return empty array when no better performing stocks exist", async () => {
      const distinctStub = sandbox
        .stub(OhlcvData, "distinct")
        .resolves(["MSFT", "GOOG"]);
      const findStub = sandbox.stub(OhlcvData, "find").returns({
        sort: () =>
          Promise.resolve([
            { date: new Date("2020-01-01"), close: 100 },
            { date: new Date("2020-01-02"), close: 90 },
          ]),
      });

      const result = await findBetterPerformingStocks(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-02"),
        50
      );

      expect(result).to.deep.equal([]);
      expect(distinctStub.calledOnceWith("ticker", { ticker: { $ne: "AAPL" } }))
        .to.be.true;
    });

    it("should return sorted list of better performing stocks", async () => {
      const distinctStub = sandbox
        .stub(OhlcvData, "distinct")
        .resolves(["MSFT", "GOOG", "META"]);

      const findStub = sandbox.stub(OhlcvData, "find");
      findStub.callsFake((query) => {
        const mockData = {
          MSFT: [
            { date: new Date("2020-01-01"), close: 100 },
            { date: new Date("2020-01-02"), close: 130 },
          ],
          GOOG: [
            { date: new Date("2020-01-01"), close: 100 },
            { date: new Date("2020-01-02"), close: 150 },
          ],
          META: [
            { date: new Date("2020-01-01"), close: 100 },
            { date: new Date("2020-01-02"), close: 110 },
          ],
        };

        return {
          sort: () => Promise.resolve(mockData[query.ticker]),
        };
      });

      const result = await findBetterPerformingStocks(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-02"),
        20 // original profit
      );

      expect(result).to.deep.equal([
        { ticker: "GOOG", profit: 50 },
        { ticker: "MSFT", profit: 30 },
      ]);
    });

    it("should handle empty distinct tickers result", async () => {
      sandbox.stub(OhlcvData, "distinct").resolves([]);

      const result = await findBetterPerformingStocks(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-02"),
        10
      );

      expect(result).to.deep.equal([]);
    });

    it("should handle null analysis results", async () => {
      sandbox.stub(OhlcvData, "distinct").resolves(["MSFT"]);
      sandbox.stub(OhlcvData, "find").returns({
        sort: () => Promise.resolve([]), //    This will  cause calculateBestTradeAndMaxProfitForAPeriod to return null
      });

      const result = await findBetterPerformingStocks(
        "AAPL",
        new Date("2020-01-01"),
        new Date("2020-01-02"),
        10
      );

      expect(result).to.deep.equal([]);
    });
  });
});
