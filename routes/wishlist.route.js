import express from "express";
import userAuth  from "../middleware/userAuth.middleware.js";
import adminAuth from "../middleware/adminAuth.middleware.js";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  adminGetAllWishlists,
  adminGetWishlistById,
  adminDeleteWishlist,
} from "../controllers/wishlist.controller.js";

const wishlistRoute = express.Router();

// ── User routes ────────────────────────────────────────────────
wishlistRoute.post("/",             userAuth, addToWishlist);
wishlistRoute.get("/",              userAuth, getWishlist);
wishlistRoute.delete("/:productId", userAuth, removeFromWishlist);

// ── Admin routes ───────────────────────────────────────────────
wishlistRoute.get("/admin/all",      adminAuth, adminGetAllWishlists);
wishlistRoute.get("/admin/:id",      adminAuth, adminGetWishlistById);
wishlistRoute.delete("/admin/:id",   adminAuth, adminDeleteWishlist);

export default wishlistRoute;
