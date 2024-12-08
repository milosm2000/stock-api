import { connectDB } from "./config/database.js";
import express from "express";

import stockRoutes from "./routes/stockRoutes.js";
import ohlcvRoutes from "./routes/ohlcvRoutes.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  try {
    console.log(JSON.stringify(req.body));
  } catch (error) {
    console.error("Error logging request body:", error);
  }
  next();
});

app.use("/api", stockRoutes);
app.use("/api", ohlcvRoutes);

connectDB();

export { app };
