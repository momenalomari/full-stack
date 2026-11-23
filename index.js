import { pathToFileURL } from "node:url";
import "dotenv/config";
import { pool } from "./src/config/db.js";
import express from "express";
import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import projectRoutes from "./src/routes/project.route.js";
import proposalRoutes from "./src/routes/proposal.route.js";
import categoryRoutes from "./src/routes/category.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import agentRoutes from "./src/routes/agent.route.js";
import feedbackRoutes from "./src/routes/feedback.route.js";
import moderatorRoutes from "./src/routes/moderator.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./src/middleware/error.middleware.js";

export const app = express();
const configuredClientOrigin =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: configuredClientOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    req.get("X-Requested-With") !== "XMLHttpRequest"
  ) {
    return res.status(403).json({ message: "CSRF validation failed" });
  }

  return next();
});
app.get("/health", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/proposal", proposalRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/moderator", moderatorRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await pool.query("SELECT 1");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("Server is running on port", port));
}
