import express from "express";
import upload from "../middleware/multer.js";
import { createUser, login, sendOtp, updateUser, getAllUsers, getUserById } from "../controllers/user.controller.js";
import userAuth from "../middleware/userAuth.middleware.js";
import adminAuth from "../middleware/adminAuth.middleware.js";

const userRoute = express.Router();

userRoute.post("/create", upload.single("profilePhoto"), createUser);
userRoute.post("/sendOtp", sendOtp);
userRoute.post("/login", login);
userRoute.put("/update", userAuth, upload.single("profilePhoto"), updateUser);
userRoute.get("/", adminAuth, getAllUsers);
userRoute.get("/:id", adminAuth, getUserById);

export default userRoute;
