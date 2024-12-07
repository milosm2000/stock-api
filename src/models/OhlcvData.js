import mongoose from "mongoose";

const ohlcvDataSchema = new mongoose.Schema(
  {
    tickerSymbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    date: {
      type: Date,
      required: true,
    },
    open: {
      type: Number,
      required: true,
      min: 0,
    },
    high: {
      type: Number,
      required: true,
      min: 0,
    },
    low: {
      type: Number,
      required: true,
      min: 0,
    },
    close: {
      type: Number,
      required: true,
      min: 0,
    },
    adjClose: {
      type: Number,
      required: true,
      min: 0,
    },
    volume: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound indexi, TODO: proveriti ponovo koji su potrebni nakon implementiranja endpointa

ohlcvDataSchema.index({ tickerSymbol: 1, date: 1 });

const OhlcvData = mongoose.model("OhlcvData", ohlcvDataSchema);

export default OhlcvData;
