import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://mongodb:27017/stockDatabase", {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    mongoose.connection.on("connected", () => console.log("MongoDB connected"));
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
