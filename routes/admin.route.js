import express from "express";
import { adminLogin } from "../controllers/admin.controller.js";

const adminRoute = express.Router();

adminRoute.post("/login", adminLogin);

export default adminRoute;
