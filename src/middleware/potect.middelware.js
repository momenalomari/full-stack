
import jwt from "jsonwebtoken";

import { pool } from "../config/db.js";

export const protect = async (req, res, next) => {
  try {

    // 1. قراءة Access Token من Cookies
    const token = req.cookies?.accessTokens;

    // 2. التأكد من وجود Token
    if (!token) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // 3. التحقق من صحة Access Token
    const payload = jwt.verify(
      token,
      process.env.ACCESS_JWT_SECRET,
      {
        issuer: "my-api",
        audience: "my-client",
      }
    );

    // 4. التأكد من نوع Token
    if (payload.type !== "access" || !payload.sid) {
      return res.status(401).json({
        message: "Invalid token type",
      });
    }

    // 5. تخزين معلومات المستخدم داخل Request
    const { rows } = await pool.query(
      `SELECT u.id, u.role
       FROM users u JOIN refresh_sessions s ON s.user_id = u.id
       WHERE u.id = $1 AND s.id = $2 AND u.is_active AND u.email_verified
         AND s.revoked_at IS NULL AND s.expires_at > CURRENT_TIMESTAMP`,
      [payload.id, payload.sid],
    );
    if (!rows.length) return res.status(401).json({ message: "Session is no longer active" });
    req.user = rows[0];

    // 6. الانتقال إلى Controller التالي
    next();

  } catch (error) {

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    console.error("Error in protect middleware:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
