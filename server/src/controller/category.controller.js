import { getActiveCategories } from "../module/category.model.js";

export const getCategoriesController = async (_req, res) => {
  try {
    const categories = await getActiveCategories();
    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Category lookup failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
