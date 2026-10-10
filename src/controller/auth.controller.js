import { findUserByEmail } from "../module/user.model.js";
import { createUser } from "../module/auth.model.js";
import bcrypt from "bcrypt";


export const createUserController = async (req, res) => {
  try {
    const { username, email, password, confirm_password, role } = req.body;

    const isExist = await findUserByEmail(email);
    if (isExist.length === 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // الفحص الصحيح لكائن مفرد:
    if (isExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      username,
      email,
      hashed_password,
      role,
    });

    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error in createUserController:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isExist = await findUserByEmail(email);

    if (!isExist) {
      return res.status(400).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, isExist.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const accessToken = genrateAccessToken(isExist);
    const refreshToken = genrateRefreshToken(isExist);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      path: "/api/auth",
    });

    return res.status(200).json({ message: "Login successful", user: isExist });
  } catch (error) {
    console.error("Error in loginUserController:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESHJWT_SECRET, {
      issuer: "my-api",
      audience: "my-client",
    });
    const newAccessToken = generateAccessToken(payload);
    return res.status(200).json({ message: "Token refreshed successfully", accessToken: newAccessToken });
  } catch (error) {
    console.error("Error in refreshTokenController:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export { loginUserController };
