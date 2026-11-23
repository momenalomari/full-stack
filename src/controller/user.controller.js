import {
  getAllUsers,
  findUserById,
  updateUserById,
  updateUserStatusById,
  deactivateUserById,
  findUserByEmail,
  updateOwnProfile,
  updatePassword,
  findPasswordHashById,
} from "../module/user.model.js";
import bcrypt from "bcrypt";

export const getAllUsersController = async (req, res) => {
  try {
    const result = await getAllUsers();
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await findUserById(id);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserByIdController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { username, email, role, is_active } = req.body;
    if (id === Number(req.user.id) && (!is_active || role !== "admin")) {
      return res
        .status(409)
        .json({
          message: "You cannot deactivate or demote your own admin account",
        });
    }

    const result = await updateUserById(id, {
      username,
      email,
      role,
      is_active,
    });
    if (!result) return res.status(404).json({ message: "User not found" });
    return res
      .status(200)
      .json({ message: "User updated successfully", user: result });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email is already in use" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserStatusByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await updateUserStatusById(id, status);
    res
      .status(200)
      .json({ message: "User status updated successfully", user: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteUserByIdController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (id === Number(req.user.id)) {
      return res
        .status(409)
        .json({ message: "You cannot deactivate your own admin account" });
    }

    const user = await deactivateUserById(id);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found or already inactive" });
    return res.status(200).json({
      message: "User account deactivated; marketplace history was preserved",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const findUserByEmailController = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await findUserByEmail(email);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        role: result.role,
        is_active: result.is_active,
        status: result.status,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfileController = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        message: "Username must be between 3 and 30 characters",
      });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const user = await updateOwnProfile(req.user.id, username, email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email is already in use" });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    if (newPassword.length < 6 || newPassword.length > 30) {
      return res.status(400).json({
        message: "New password must be between 6 and 30 characters",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    const record = await findPasswordHashById(req.user.id);
    if (!record || !(await bcrypt.compare(currentPassword, record.password_hash))) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const changed = await updatePassword(req.user.id, passwordHash, record.password_hash);
    if (!changed) return res.status(409).json({ message: "Password already changed. Sign in again." });
    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
