import express from "express";
import cors from "cors";

import analyzeRouter from "./routes/analyze.js";
import historyRouter from "./routes/history.js";
import resultRouter from "./routes/result.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/auth", authRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/history", historyRouter);
app.use("/api/result", resultRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "shadowmode-backend" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal server error",
  });
});

export default app;