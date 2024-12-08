import * as ohlcvService from "../services/ohlcvService.js";

export const analyzeProfitPotential = async (req, res) => {
  try {
    const { ticker, startDate, endDate } = req.params;
    const analysis = await ohlcvService.analyzeProfitPotential(
      ticker,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(analysis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
