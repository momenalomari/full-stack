import express from "express";
import { protect } from "../middleware/potect.middelware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  publicFeedbackController,
  submitFeedbackController,
  pendingFeedbackController,
  reviewFeedbackController,
} from "../controller/feedback.controller.js";

const router = express.Router();

router.get("/approved", publicFeedbackController);
router.post("/", protect, submitFeedbackController);
router.get(
  "/pending",
  protect,
  requireRole("moderator", "admin"),
  pendingFeedbackController,
);
router.patch(
  "/:id/review",
  protect,
  requireRole("moderator", "admin"),
  reviewFeedbackController,
);

export default router;
