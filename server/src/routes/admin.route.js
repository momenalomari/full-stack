import express from "express";
import { getAdminDashboardController } from "../controller/admin.controller.js";
import { protect } from "../middleware/potect.middelware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  requireRole("admin"),
  getAdminDashboardController,
);

export default router;
