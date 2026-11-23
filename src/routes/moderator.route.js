import express from "express";
import { protect } from "../middleware/potect.middelware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { getModeratorDashboardController } from "../controller/moderator.controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  requireRole("moderator", "admin"),
  getModeratorDashboardController,
);

export default router;
