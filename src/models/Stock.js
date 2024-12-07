import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    ticker: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    foundingDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

stockSchema.index({ ticker: 1 });

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
