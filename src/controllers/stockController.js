import * as stockService from "../services/stockService.js";

export const createStock = async (req, res) => {
  try {
    const stock = await stockService.createStock(req.body);
    res.status(201).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllStocks = async (req, res) => {
  try {
    const stocks = await stockService.getAllStocks();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockByTicker = async (req, res) => {
  try {
    const stock = await stockService.getStockByTicker(req.params.ticker);
    res.json(stock);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const stock = await stockService.updateStock(req.params.ticker, req.body);
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const deleteStock = async (req, res) => {
  try {
    const stock = await stockService.deleteStock(req.params.ticker);
    res.json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
