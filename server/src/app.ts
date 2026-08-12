import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import todoRoutes from "./routes/todo.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/todos", todoRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Todo API is running",
  });
});

app.use(errorHandler);

export default app;