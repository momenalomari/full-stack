import express from "express";
import { rateLimit } from "express-rate-limit";

import {
  createUserController,
  currentUserController,
  loginUserController,
  logoutController,
  refreshTokenController,
  verifyEmailController,
  resendVerificationController,
} from "../controller/auth.controller.js";

import {
  createUserSchema,
  loginUserSchema,
} from "../validation/auth.validation.js";

import { validateRegister } from "../middleware/validate.middeleware.js";

import { rateLimitLogin } from "../middleware/rate_limitLogin.middleware.js";
import { protect } from "../middleware/potect.middelware.js";
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
} from "../controller/user.controller.js";

const router = express.Router();

router.get(
  "/me",
  (req, res, next) => {
    if (!req.cookies?.accessTokens && !req.cookies?.refreshToken) {
      return res.status(200).json({ user: null });
    }
    return protect(req, res, next);
  },
  currentUserController,
);

// Register
router.post(
  "/register",
  validateRegister(createUserSchema),
  createUserController,
);

// Login
router.post(
  "/login",
  rateLimitLogin,
  validateRegister(loginUserSchema),
  loginUserController,
);

// Refresh Access Token
router.post("/refresh", refreshTokenController);

router.post("/logout", logoutController);
router.post("/verify-email/resend", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  message: { message: "Too many verification requests. Please try again in 15 minutes." },
}), resendVerificationController);
router.post("/verify-email/:token", verifyEmailController);
router.get("/profile", protect, getProfileController);
router.patch("/profile", protect, updateProfileController);
router.post("/change-password", protect, changePasswordController);

export default router;
