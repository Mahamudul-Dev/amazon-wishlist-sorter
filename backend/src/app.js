import express from "express";
import cors from "cors";
import cookieRouter from "./routes/cookie_router.js";
import scrapperRouter from "./routes/scraper_router.js";
import morgan from "morgan"; // Optional: logging middleware

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Logs all requests to console

// API Routes
app.use("/api/cookie", cookieRouter);
app.use("/api/scraper", scrapperRouter);

// Health Check (optional but useful for uptime monitoring)
app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

export default app;
