import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

// ACCESS TOKEN
export const genrateAccessToken = (user, sessionId) => {
  return jwt.sign(
    {
      id: user.id,
      sid: sessionId,
      username: user.username,
      role: user.role,
      type: "access",
    },
    process.env.ACCESS_JWT_SECRET,
    {
      expiresIn: "15m",
      issuer: "my-api",
      audience: "my-client",
    },
  );
};

// REFRESH TOKEN
export const genrateRefreshToken = (user, sessionId) => {
  return jwt.sign(
    {
      id: user.id,
      sid: sessionId,
      jti: randomUUID(),
      type: "refresh",
    },
    process.env.REFRESH_JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "my-api",
      audience: "my-client",
    },
  );
};
