import { getAdminDashboardData } from "../module/admin.model.js";

export const getAdminDashboardController = async (_req, res) => {
  try {
    const dashboard = await getAdminDashboardData();
    return res.status(200).json({ dashboard });
  } catch (error) {
    console.error("Admin dashboard lookup failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
