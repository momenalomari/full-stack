import express from "express";
import { rateLimit } from "express-rate-limit";
import { generateAgentReplyController } from "../controller/agent.controller.js";
import { protect } from "../middleware/potect.middelware.js";
import { validateRegister } from "../middleware/validate.middeleware.js";
import { agentRequestSchema } from "../validation/agent.validation.js";

const router = express.Router();

const rateLimitAgent = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "AI request limit reached. Try again in a few minutes." },
});

router.post(
  "/",
  protect,
  rateLimitAgent,
  validateRegister(agentRequestSchema),
  generateAgentReplyController,
);

export default router;
