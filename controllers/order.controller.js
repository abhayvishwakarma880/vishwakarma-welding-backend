import Order from "../models/order.model.js";

// Create a new order (public endpoint, user optional)
export const createOrder = async (req, res) => {
  try {
    const {
      name,
      email,
      orderFor,
      message,
      address,
      pincode,
      city,
      state,
    } = req.body;

    const order = await Order.create({
      userId: req.user ? req.user._id : null,
      name,
      email,
      orderFor,
      message,
      address,
      pincode,
      city,
      state,
    });
    return res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get all orders (list)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get a single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Update an order by ID (partial update)
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const order = await Order.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
