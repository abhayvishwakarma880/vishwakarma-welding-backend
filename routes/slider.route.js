import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.middleware.js";
import {
  createSlider, getAllSliders, getSliderById,
  updateSlider, toggleSliderStatus, deleteSlider,
} from "../controllers/slider.controller.js";

const sliderRoute = express.Router();

sliderRoute.get("/",              getAllSliders);
sliderRoute.get("/:id",           getSliderById);
sliderRoute.post("/create",       adminAuth, upload.single("image"), createSlider);
sliderRoute.put("/update/:id",    adminAuth, upload.single("image"), updateSlider);
sliderRoute.patch("/toggle/:id",  adminAuth, toggleSliderStatus);
sliderRoute.delete("/delete/:id", adminAuth, deleteSlider);

export default sliderRoute;
