import Wishlist from "../models/wishlist.model.js";

// ── Add to Wishlist ───────────────────────────────────────────
export const addToWishlist = async (req, res) => {
  try {
    const userId    = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    const item = await Wishlist.create({ userId, productId });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get User Wishlist ─────────────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const items = await Wishlist.find({ userId })
      .populate("productId", "name mainImage price discount isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Remove from Wishlist ──────────────────────────────────────
export const removeFromWishlist = async (req, res) => {
  try {
    const userId    = req.user._id;
    const { productId } = req.params;

    const item = await Wishlist.findOneAndDelete({ userId, productId });

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in wishlist" });
    }

    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
