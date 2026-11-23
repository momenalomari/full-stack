import { getModeratorDashboardData } from "../module/moderator.model.js";

export const getModeratorDashboardController = async (_req, res) => {
  try {
    return res.status(200).json({
      dashboard: await getModeratorDashboardData(),
    });
  } catch (error) {
    console.error("Moderator dashboard lookup failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
