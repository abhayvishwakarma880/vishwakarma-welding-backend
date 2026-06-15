import Gallery from "../models/gallery.model.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// ── Create ────────────────────────────────────────────────────
export const createGallery = async (req, res) => {
  try {
    const { category, title, description } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: "category is required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "image is required" });
    }

    const uploaded = await uploadToCloudinary(req.file.buffer, "vishwakarma/gallery");
    const image = { url: uploaded.secure_url, publicId: uploaded.public_id };

    const gallery = await Gallery.create({ image, category, title, description });

    res.status(201).json({ success: true, data: gallery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All ───────────────────────────────────────────────────
export const getAllGallery = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;
    const category = req.query.category;
    const isActive = req.query.isActive;
    const search   = req.query.search?.trim();

    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined && isActive !== "") query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Gallery.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Gallery.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get By ID ─────────────────────────────────────────────────
export const getGalleryById = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id).populate("category", "name");

    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update ────────────────────────────────────────────────────
export const updateGallery = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    const { category, title, description } = req.body;

    if (category)              item.category    = category;
    if (title !== undefined)   item.title       = title;
    if (description !== undefined) item.description = description;

    if (req.file) {
      if (item.image?.publicId) {
        await cloudinary.uploader.destroy(item.image.publicId);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, "vishwakarma/gallery");
      item.image = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }

    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Toggle Status ─────────────────────────────────────────────
export const toggleGalleryStatus = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Gallery item ${item.isActive ? "activated" : "deactivated"} successfully`,
      data: item,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete ────────────────────────────────────────────────────
export const deleteGallery = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    if (item.image?.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: "Gallery item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
