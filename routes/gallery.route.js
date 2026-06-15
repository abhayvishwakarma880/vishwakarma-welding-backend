import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.middleware.js";
import {
  createGallery, getAllGallery, getGalleryById,
  updateGallery, toggleGalleryStatus, deleteGallery,
} from "../controllers/gallery.controller.js";

const galleryRoute = express.Router();

galleryRoute.get("/",             getAllGallery);
galleryRoute.get("/:id",          getGalleryById);
galleryRoute.post("/create",      adminAuth, upload.single("image"), createGallery);
galleryRoute.put("/update/:id",   adminAuth, upload.single("image"), updateGallery);
galleryRoute.patch("/toggle/:id", adminAuth, toggleGalleryStatus);
galleryRoute.delete("/delete/:id",adminAuth, deleteGallery);

export default galleryRoute;
