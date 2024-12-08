import { connectDB } from "./config/database.js";
import express from "express";

import stockRoutes from "./routes/stockRoutes.js";

const app = express();
app.use(express.json());

app.use(
  "/api",
  (req, res, next) => {
    try {
      console.log(JSON.stringify(req.body));
    } catch (error) {}

    next();
  },
  stockRoutes
);

connectDB();

export { app };
