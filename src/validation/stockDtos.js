import Joi from "joi";

// Create
export const createStockDto = Joi.object({
  companyName: Joi.string().required().trim(),
  ticker: Joi.string().required().trim().uppercase(),
  foundingDate: Joi.date().required(),
});

// Read, Delete
export const getStockByTickerDto = Joi.object({
  ticker: Joi.string().required().trim().uppercase(),
});

// Update
export const updateStockDto = Joi.object({
  companyName: Joi.string().trim(),
  ticker: Joi.string().trim().uppercase(),
  foundingDate: Joi.date(),
}).min(1);

// Pagination
export const getPaginatedStocksDto = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid("ticker", "companyName", "foundingDate")
    .default("ticker"),
});
