import express from "express";
import { protect } from "../middleware/potect.middelware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validateRegister } from "../middleware/validate.middeleware.js";
import { updateUserSchema } from "../validation/admin.validation.js";
import {
  getAllUsersController,
  getUserByIdController,
  findUserByEmailController,
  updateUserByIdController,
  updateUserStatusByIdController,
  deleteUserByIdController,
} from "../controller/user.controller.js";
const router = express.Router();
router.use(protect, requireRole("admin"));
router.get("/getusers", getAllUsersController);
router.get("/getuser/:id", getUserByIdController);
router.get("/getuserbyemail/:email", findUserByEmailController);
router.put(
  "/updateuser/:id",
  validateRegister(updateUserSchema),
  updateUserByIdController,
);
router.put("/updateuserstatus/:id", updateUserStatusByIdController);
router.delete("/deleteuser/:id", deleteUserByIdController);

export default router;
