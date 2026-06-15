import express from "express";
import upload from "../middleware/multer.js";
import { createUser, login, sendOtp, updateUser, getAllUsers, getUserById, adminUpdateUser, adminToggleUserStatus } from "../controllers/user.controller.js";
import userAuth from "../middleware/userAuth.middleware.js";
import adminAuth from "../middleware/adminAuth.middleware.js";

const userRoute = express.Router();

userRoute.post("/create", upload.single("profilePhoto"), createUser);
userRoute.post("/sendOtp", sendOtp);
userRoute.post("/login", login);
userRoute.put("/update", userAuth, upload.single("profilePhoto"), updateUser);
userRoute.get("/", adminAuth, getAllUsers);
userRoute.get("/:id", adminAuth, getUserById);
userRoute.put("/admin/update/:id", adminAuth, upload.single("profilePhoto"), adminUpdateUser);
userRoute.patch("/admin/toggle/:id", adminAuth, adminToggleUserStatus);

export default userRoute;
