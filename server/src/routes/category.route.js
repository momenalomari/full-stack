import express from "express";
import { getCategoriesController } from "../controller/category.controller.js";

const router = express.Router();

router.get("/", getCategoriesController);

export default router;
