import {  getAllUsers,
    findUserById,
    updateUserById,
    updateUserStatusById,
    deleteUserById,
    findUserByEmail 
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
        const { id } = req.params;
        const { username, email, role, is_active } = req.body;
        const result = await updateUserById(id, { username, email, role, is_active });
        res.status(200).json({ message: "User updated successfully", user: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserStatusByIdController = async (req, res) => {
    try{
        const {id }= req.params;
        const {status}= req.body;
        const result = await updateUserStatusById(id, status);
        res.status(200).json({ message: "User status updated successfully", user: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    } 

};
export const deleteUserByIdController = async(req , res)=>{
    try{
        const {id}= req.params;
        const result = await deleteUserById(id);
        res.status(200).json({ message: "User deleted successfully", user: result });
     } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    } 
};
export const findUserByEmailController = async (req, res) => {
    try {
        const { email } = req.params;
        const result = await findUserByEmail(email);
        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

