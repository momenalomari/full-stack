import { connectDB } from "./src/config/db.js";
import express from "express";
import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import cookieParser from "cookie-parser";


const app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/health", (req, res) => {
    res.send("Server is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


connectDB();
app.listen(process.env.PORT, () => {
  console.log("Server is running on port ", process.env.port);
});
