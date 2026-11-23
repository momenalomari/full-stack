import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  getProjectsByClient,
  updateProject,
} from "../module/project.model.js";
import { uploadToCloudinary } from "../utiles/uplodeToCloudinary.js";

// ================= CREATE PROJECT =================

export const createProjectController = async (req, res) => {
  try {
    const { title, description, budget, category_id, deadline } = req.body;

    const client_id = req.user.id;
    const image_url = req.file
      ? (await uploadToCloudinary(req.file.buffer)).secure_url
      : null;

    const newProject = await createProject({
      client_id,
      category_id,
      title,
      description,
      budget,
      deadline,
      image_url,
    });

    return res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMyProjectsController = async (req, res) => {
  try {
    const projects = await getProjectsByClient(req.user.id);
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching owned projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET ALL OPEN PROJECTS =================

export const getAllProjectsController = async (req, res) => {
  try {
    const categoryId = req.query.category
      ? Number(req.query.category)
      : null;
    if (categoryId !== null && (!Number.isSafeInteger(categoryId) || categoryId <= 0)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 12);
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 ||
        !Number.isSafeInteger((page - 1) * Math.min(limit, 50))) {
      return res.status(400).json({ message: "Page and limit must be valid positive integers" });
    }

    const result = await getAllProjects({
      status: "open",
      search: String(req.query.search || "").trim(),
      sort: String(req.query.sort || "newest"),
      page,
      limit,
      categoryId,
    });

    return res.status(200).json({
      message: "Projects fetched successfully",
      projects: result.projects,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ================= GET PROJECT BY ID =================

export const getProjectByIdController = async (req, res) => {
  try {
    const project_id = Number(req.params.id);

    if (!Number.isSafeInteger(project_id) || project_id <= 0) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const project = await getProjectById(project_id);

    if (!project || project.status !== "open") {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      message: "Project fetched successfully",
      project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ================= UPDATE PROJECT =================

export const updateProjectController = async (req, res) => {
  try {
    const project_id = Number(req.params.id);
    const client_id = req.user.id;
    const { title, description, deadline, budget, category_id } = req.body;

    if (!Number.isSafeInteger(project_id) || project_id <= 0) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const updatedProject = await updateProject(project_id, client_id, {
      title,
      description,
      deadline,
      budget,
      category_id,
    });

    if (!updatedProject) {
      return res.status(404).json({
        message: "Project not found or cannot be updated",
      });
    }

    return res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteProjectController = async (req, res) => {
  try {
    const project_id = Number(req.params.id);
    const client_id = req.user.id;

    if (!Number.isSafeInteger(project_id) || project_id <= 0) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const deletedProject = await deleteProject(project_id, client_id);

    if (!deletedProject) {
      return res.status(404).json({
        message: "Project not found or cannot be deleted",
      });
    }

    return res.status(200).json({
      message: "Project cancelled successfully",
      project: deletedProject,
    });
  } catch (error) {
    console.error("Error deleting project:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
