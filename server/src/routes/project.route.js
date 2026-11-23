import express from "express";

import { protect } from "../middleware/potect.middelware.js";
import upload from "../middleware/uplode.middelware.js";

import { validateRegister } from "../middleware/validate.middeleware.js";

import {
  createProjectSchema,
  updateProjectSchema,
} from "../validation/project.validation.js";

import {
  createProjectController,
  deleteProjectController,
  getProjectByIdController,
  getAllProjectsController,
  getMyProjectsController,
  updateProjectController,
} from "../controller/project.controller.js";

const router = express.Router();
const uploadProjectImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) return next();

    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller"
          : error.message,
    });
  });
};

router.post(
  "/create",
  protect,
  uploadProjectImage,
  validateRegister(createProjectSchema),
  createProjectController,
);
router.get("/projects", getAllProjectsController);
router.get("/mine", protect, getMyProjectsController);
router.get("/getProjcet/:id", getProjectByIdController);
router.get("/projects/:id", getProjectByIdController);
router.patch(
  "/update/:id",
  protect,
  validateRegister(updateProjectSchema),
  updateProjectController,
);
router.delete("/delete/:id", protect, deleteProjectController);

export default router;
