import Slider from "../models/slider.model.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// ── Create ────────────────────────────────────────────────────
export const createSlider = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const uploaded = await uploadToCloudinary(req.file.buffer, "vishwakarma/sliders");
    const image = { url: uploaded.secure_url, publicId: uploaded.public_id };

    const slider = await Slider.create({ image });

    res.status(201).json({ success: true, data: slider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All ───────────────────────────────────────────────────
export const getAllSliders = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;
    const isActive = req.query.isActive;

    const query = {};
    if (isActive !== undefined && isActive !== "") query.isActive = isActive === "true";

    const [sliders, total] = await Promise.all([
      Slider.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Slider.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: sliders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get By ID ─────────────────────────────────────────────────
export const getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({ success: false, message: "Slider not found" });
    }

    res.status(200).json({ success: true, data: slider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update (image replace) ────────────────────────────────────
export const updateSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({ success: false, message: "Slider not found" });
    }

    if (req.file) {
      if (slider.image?.publicId) {
        await cloudinary.uploader.destroy(slider.image.publicId);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, "vishwakarma/sliders");
      slider.image = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }

    await slider.save();

    res.status(200).json({ success: true, data: slider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Toggle Status ─────────────────────────────────────────────
export const toggleSliderStatus = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({ success: false, message: "Slider not found" });
    }

    slider.isActive = !slider.isActive;
    await slider.save();

    res.status(200).json({
      success: true,
      message: `Slider ${slider.isActive ? "activated" : "deactivated"} successfully`,
      data: slider,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete ────────────────────────────────────────────────────
export const deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({ success: false, message: "Slider not found" });
    }

    if (slider.image?.publicId) {
      await cloudinary.uploader.destroy(slider.image.publicId);
    }

    await slider.deleteOne();

    res.status(200).json({ success: true, message: "Slider deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
