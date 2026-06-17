import express from "express";
import adminAuth from "../middleware/adminAuth.middleware.js";
import optionalUserAuth from "../middleware/optionalUserAuth.middleware.js";
import { createOrder, getOrders, getOrderById, updateOrder } from "../controllers/order.controller.js";

const router = express.Router();

// User route for creating order
router.post("/", optionalUserAuth, createOrder);

// Admin routes for orders
router.get("/", adminAuth, getOrders);
router.get("/:id", adminAuth, getOrderById);
router.put("/:id", adminAuth, updateOrder);

export default router;
