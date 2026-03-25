import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { initializePassport } from "./config/passport";
import authRoutes from "./routes/auth";
import workspaceRoutes from "./routes/workspace";
import dataRoutes from "./routes/data";
import analyticsRoutes from "./routes/analytics";
import aiRoutes from "./routes/ai";
import dashboardRoutes from "./routes/dashboard";

const app = express();

// Middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Passport config
initializePassport();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces", dataRoutes);
app.use("/api/workspaces", analyticsRoutes);
app.use("/api/workspaces", aiRoutes);
app.use("/api/workspaces", dashboardRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

startServer();
