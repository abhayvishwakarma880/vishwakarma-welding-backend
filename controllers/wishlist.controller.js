import Wishlist from "../models/wishlist.model.js";

// ── Admin: Get All Wishlists ──────────────────────────────────
export const adminGetAllWishlists = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const skip   = (page - 1) * limit;
    const search = req.query.search?.trim();

    // Build query — we'll match on populated fields after, so use aggregation
    let query = {};

    const [items, total] = await Promise.all([
      Wishlist.find(query)
        .populate("userId",    "name mobile email profilePhoto isActive")
        .populate("productId", "name price discount mainImage category isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Wishlist.countDocuments(query),
    ]);

    // Apply in-memory search on populated fields (name/mobile)
    let filtered = items;
    if (search) {
      const q = search.toLowerCase();
      filtered = items.filter((item) => {
        const userName    = item.userId?.name?.toLowerCase()    || "";
        const userMobile  = item.userId?.mobile?.toLowerCase()  || "";
        const productName = item.productId?.name?.toLowerCase() || "";
        return userName.includes(q) || userMobile.includes(q) || productName.includes(q);
      });
    }

    res.status(200).json({
      success: true,
      data: filtered,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: Get Wishlist By ID ─────────────────────────────────
export const adminGetWishlistById = async (req, res) => {
  try {
    const item = await Wishlist.findById(req.params.id)
      .populate("userId",    "name mobile email profilePhoto city state address pincode isActive")
      .populate("productId", "name price discount finalPrice mainImage category description isActive slug");

    if (!item) return res.status(404).json({ success: false, message: "Wishlist item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: Delete Wishlist Item ───────────────────────────────
export const adminDeleteWishlist = async (req, res) => {
  try {
    const item = await Wishlist.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Wishlist item not found" });
    res.status(200).json({ success: true, message: "Wishlist item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
