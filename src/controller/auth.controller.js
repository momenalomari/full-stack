import { findUserByEmail, findUserById } from "../module/user.model.js";
import { createUser } from "../module/auth.model.js";

import { genrateAccessToken, genrateRefreshToken } from "../utiles/token.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  createRefreshSession,
  revokeRefreshSession,
  rotateRefreshSession,
} from "../module/session.model.js";
import {
  setEmailVerified,
  resendVerificationEmail,
} from "../module/user.model.js";
import { sendVerificationEmail } from "../utiles/email.js";

const refreshLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.cookie("accessTokens", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: refreshLifetimeMs,
    path: "/api/auth",
  });
};

const clearAuthCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.clearCookie("accessTokens", { ...cookieOptions, path: "/" });
  res.clearCookie("refreshToken", { ...cookieOptions, path: "/api/auth" });
};

// ================= REGISTER =================

export const createUserController = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const isExist = await findUserByEmail(email);

    if (isExist) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const verificationToken = randomBytes(32).toString("hex");
    const verificationHash = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await createUser({
      username,
      email,
      hashed_password,
      role: "user",
      email_verification_hash: verificationHash,
      email_verification_expires_at: expiresAt,
    });

    try {
      await sendVerificationEmail({
        email,
        username,
        verificationToken,
      });
    } catch (emailError) {
      console.error("Verification email delivery failed:", emailError);
      return res.status(201).json({
        message:
          "Account created, but the verification email could not be sent.",
        emailSent: false,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          email_verified: newUser.email_verified,
        },
      });
    }

    return res.status(201).json({
      message: "Check your inbox and spam folder for your verification link.",
      emailSent: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        email_verified: newUser.email_verified,
      },
    });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Email already exists" });
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ================= LOGIN =================

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await findUserByEmail(email);

    if (!user || user.is_active === false) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        code: "EMAIL_VERIFICATION_REQUIRED",
        message: "Please verify your email address before signing in",
      });
    }

    const sessionId = randomUUID();
    const refreshToken = genrateRefreshToken(user, sessionId);
    const created = await createRefreshSession({
      passwordHash: user.password_hash,
      id: sessionId,
      user_id: user.id,
      token_hash: hashToken(refreshToken),
      expires_at: new Date(Date.now() + refreshLifetimeMs),
    });
    if (!created) return res.status(401).json({ message: "Please sign in again" });
    const accessToken = genrateAccessToken(user, sessionId);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ================= REFRESH TOKEN =================

export const refreshTokenController = async (req, res) => {
  try {
    // 1. Get refresh token from cookies
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    // 2. Verify refresh token
    const payload = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, {
      issuer: "my-api",
      audience: "my-client",
    });

    if (payload.type !== "refresh" || !payload.sid || !payload.jti) {
      return res.status(401).json({
        message: "Invalid token type",
      });
    }

    // 4. Get user from database
    const user = await findUserById(payload.id);

    if (!user || !user.is_active || !user.email_verified) {
      return res.status(401).json({
        message: "Account unavailable",
      });
    }

    const nextRefreshToken = genrateRefreshToken(user, payload.sid);
    const rotated = await rotateRefreshSession({
      id: payload.sid,
      previousTokenHash: hashToken(refreshToken),
      nextTokenHash: hashToken(nextRefreshToken),
      expiresAt: new Date(Date.now() + refreshLifetimeMs),
    });

    if (!rotated) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh session is invalid" });
    }

    const newAccessToken = genrateAccessToken(user, payload.sid);
    setAuthCookies(res, newAccessToken, nextRefreshToken);

    // 7. Send response
    return res.status(200).json({
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      console.log("JWT refresh error:", error.name);

      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    console.error("Refresh error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logoutController = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, {
        issuer: "my-api",
        audience: "my-client",
      });

      if (payload.type === "refresh" && payload.sid) {
        await revokeRefreshSession(payload.sid, hashToken(refreshToken));
      }
    } catch (error) {
      if (
        !["TokenExpiredError", "JsonWebTokenError", "NotBeforeError"].includes(
          error.name,
        )
      ) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  clearAuthCookies(res);
  return res.status(204).end();
};

export const verifyEmailController = async (req, res) => {
  const token = String(req.params.token || "");
  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  const user = await setEmailVerified(hashToken(token));
  if (!user) {
    return res.status(400).json({
      message: "Verification token is invalid or has expired",
    });
  }

  return res.status(200).json({
    message: "Email verified successfully",
    user,
  });
};

export const resendVerificationController = async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "A valid email address is required" });
  }

  const verificationToken = randomBytes(32).toString("hex");
  try {
    await resendVerificationEmail(email, hashToken(verificationToken), async (user) => {
      await sendVerificationEmail({ email: user.email, username: user.username, verificationToken });
    });
  } catch (error) {
    if (error.verificationDeliveryFailed) {
      return res.status(503).json({ message: "Email delivery is unavailable. Please try again later." });
    }
    throw error;
  }

  return res.status(200).json({
    message: "If this address has an active account awaiting verification, check its inbox and spam folder.",
  });
};

export const currentUserController = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user || user.is_active === false) {
      return res.status(401).json({ message: "Not authorized" });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Current user lookup failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
