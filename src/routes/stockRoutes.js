import express from "express";
import * as stockController from "../controllers/stockController.js";
import { validateDto } from "../middleware/validateDto.js";
import {
  getStockByTickerDto,
  createStockDto,
  updateStockDto,
} from "../validation/stockDtos.js";

const router = express.Router();

router.post(
  "/stocks",
  validateDto(createStockDto, "body"),
  stockController.createStock
);
router.get(
  "/stocks/:ticker",
  validateDto(getStockByTickerDto, "params"),
  stockController.getStockByTicker
);
router.put(
  "/stocks/:ticker",
  validateDto(getStockByTickerDto, "params"),
  validateDto(updateStockDto, "body"),
  stockController.updateStock
);
router.delete(
  "/stocks/:ticker",
  validateDto(getStockByTickerDto, "params"),
  stockController.deleteStock
);

export default router;
