import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.middleware.js";
import {
  createRecentSideWork,
  getAllRecentSideWorks,
  getRecentSideWorkBySlug,
  getRecentSideWorkById,
  updateRecentSideWork,
  toggleRecentSideWorkStatus,
  deleteRecentSideWork,
} from "../controllers/recentSideWork.controller.js";

const recentSideWorkRoute = express.Router();

const uploadFields = upload.fields([
  { name: "coverImage",   maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

recentSideWorkRoute.get("/",              getAllRecentSideWorks);
recentSideWorkRoute.get("/slug/:slug",    getRecentSideWorkBySlug);
recentSideWorkRoute.get("/:id",           getRecentSideWorkById);
recentSideWorkRoute.post("/create",       adminAuth, uploadFields, createRecentSideWork);
recentSideWorkRoute.put("/update/:id",    adminAuth, uploadFields, updateRecentSideWork);
recentSideWorkRoute.patch("/toggle/:id",  adminAuth, toggleRecentSideWorkStatus);
recentSideWorkRoute.delete("/delete/:id", adminAuth, deleteRecentSideWork);

export default recentSideWorkRoute;
