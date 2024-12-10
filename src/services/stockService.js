import Stock from "../models/Stock.js";

export const createStock = async (stockData) => {
  try {
    const stock = new Stock(stockData);
    return await stock.save();
  } catch (error) {
    throw error;
  }
};

export const getAllStocks = async () => {
  try {
    return await Stock.find({});
  } catch (error) {
    throw error;
  }
};

export const getStockByTicker = async (ticker) => {
  try {
    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    if (!stock) {
      throw new Error("Stock not found");
    }
    return stock;
  } catch (error) {
    throw error;
  }
};

export const updateStock = async (ticker, updateData) => {
  try {
    const stock = await Stock.findOneAndUpdate(
      { ticker: ticker.toUpperCase() },
      updateData,
      { new: true, runValidators: true }
    );
    if (!stock) {
      throw new Error("Stock not found");
    }
    return stock;
  } catch (error) {
    throw error;
  }
};

export const deleteStock = async (ticker) => {
  try {
    const stock = await Stock.findOneAndDelete({
      ticker: ticker.toUpperCase(),
    });
    if (!stock) {
      throw new Error("Stock not found");
    }
    return stock;
  } catch (error) {
    throw error;
  }
};

export const getPaginatedStocks = async (
  page = 1,
  limit = 20,
  sortBy = "ticker"
) => {
  try {
    const skip = (page - 1) * limit;

    const stocks = await Stock.find({})
      .sort({ [sortBy]: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Stock.countDocuments({});

    return {
      stocks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: skip + stocks.length < total,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw error;
  }
};
