import { connectDB } from "./config/database.js";
import express from "express";

const app = express();

connectDB();

app.use(express.json());

export { app };
