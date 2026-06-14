import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.middleware.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const categoryRoute = express.Router();

categoryRoute.get("/all", getAllCategories);
categoryRoute.get("/:id", getCategoryById);
categoryRoute.post("/create", adminAuth, upload.single("image"), createCategory);
categoryRoute.put("/update/:id", adminAuth, upload.single("image"), updateCategory);
categoryRoute.delete("/delete/:id", adminAuth, deleteCategory);

export default categoryRoute;