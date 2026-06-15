import express from "express";
import userAuth from "../middleware/userAuth.middleware.js";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";

const wishlistRoute = express.Router();

wishlistRoute.post("/",              userAuth, addToWishlist);
wishlistRoute.get("/",               userAuth, getWishlist);
wishlistRoute.delete("/:productId",  userAuth, removeFromWishlist);

export default wishlistRoute;
