import mongoose from "mongoose";
import OhlcvData from "../models/OhlcvData.js";
import Stock from "../models/Stock.js";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://mongodb:27017/stockDatabase", {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    mongoose.connection.on("connected", async () => {
      console.log("MongoDB connected");

      try {
        await OhlcvData.createIndexes();
        await Stock.createIndexes();
        console.log("Indexes created successfully");
      } catch (err) {
        console.error("Error creating indexes:", err);
      }
    });
    mongoose.connection.on("error", (err) =>
      console.error("MongoDB error:", err)
    );
    mongoose.connection.on("disconnected", async () => {
      console.log("MongoDB disconnected. Retrying...");
      setTimeout(connectDB, 5000);
    });
  } catch (error) {
    console.error("Connection failed:", error);
    setTimeout(connectDB, 5000);
  }
};
