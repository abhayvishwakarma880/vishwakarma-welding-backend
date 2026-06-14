import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.middleware.js";
import {
  createProduct, getAllProducts, getProductById,
  updateProduct, toggleProductStatus, deleteProduct,
} from "../controllers/product.controller.js";

const productRoute = express.Router();

const productUpload = upload.fields([
  { name: "mainImage",    maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

productRoute.get("/",          getAllProducts);
productRoute.get("/:id",       getProductById);
productRoute.post("/create",   adminAuth, productUpload, createProduct);
productRoute.put("/update/:id", adminAuth, productUpload, updateProduct);
productRoute.patch("/toggle/:id", adminAuth, toggleProductStatus);
productRoute.delete("/delete/:id", adminAuth, deleteProduct);

export default productRoute;
