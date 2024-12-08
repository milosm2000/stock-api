import express from "express";
import * as ohlcvController from "../controllers/ohlcvController.js";
import { validateDto } from "../middleware/validateDto.js";
import { analyzeProfitDto } from "../validation/ohlcvDtos.js";

const router = express.Router();

router.get(
  "/ohlcv/:ticker/:startDate/:endDate",
  validateDto(analyzeProfitDto, "params"),
  ohlcvController.analyzeProfitPotential
);

export default router;
