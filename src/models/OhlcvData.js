import mongoose from "mongoose";

const ohlcvDataSchema = new mongoose.Schema(
  {
    ticker: {
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
    adj_close: {
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

ohlcvDataSchema.index({ ticker: 1, date: 1 });

const OhlcvData = mongoose.model("OhlcvData", ohlcvDataSchema, "ohlcv_data");

export default OhlcvData;

// db.ohlcv_data.updateMany({}, [
//   {
//     $set: {
//       open: { $toDouble: "$open" },
//       high: { $toDouble: "$high" },
//       low: { $toDouble: "$low" },
//       close: { $toDouble: "$close" },
//       adj_close: { $toDouble: "$adj_close" },
//       volume: { $toDouble: "$volume" },
//     },
//   },
// ]);
