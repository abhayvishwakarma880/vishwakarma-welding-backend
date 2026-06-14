import Category from "../models/category.model.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";


// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    let image = {};

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "vishwakarma/categories"
      );

      image = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      };
    }

    const category = await Category.create({
      name,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;
    const search   = req.query.search?.trim();
    const isActive = req.query.isActive;

    const query = {};

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined && isActive !== "") {
      query.isActive = isActive === "true";
    }

    const [categories, total] = await Promise.all([
      Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Category.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get Category By Id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Category
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      description,
      isActive,
    } = req.body;

    if (name) category.name = name;
    if (description !== undefined)
      category.description = description;
    if (isActive !== undefined)
      category.isActive = isActive;

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "vishwakarma/categories"
      );

      category.image = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      };
    }

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};