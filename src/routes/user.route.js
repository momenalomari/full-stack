
import express from "express";
import { getAllUsersController,
    getUserByIdController,
    findUserByEmailController,
    updateUserByIdController,
    updateUserStatusByIdController,
    deleteUserByIdController    

 } from "../controller/user.controller.js";
const router = express.Router();
router.get("/getusers", getAllUsersController);
router.get("/getuser/:id", getUserByIdController);
router.get("/getuserbyemail/:email", findUserByEmailController);
router.put("/updateuser/:id", updateUserByIdController);
router.put("/updateuserstatus/:id", updateUserStatusByIdController);
router.delete("/deleteuser/:id", deleteUserByIdController);

export default router;