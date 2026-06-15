import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import slugify from "../utils/slugify.js";

// ── Slug generator (unique) ───────────────────────────────────
const generateUniqueSlug = async (name, excludeId = null) => {
  let base = slugify(name);
  let slug = base;
  let count = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Product.findOne(query).lean();
    if (!exists) break;
    slug = `${base}-${count++}`;
  }
  return slug;
};

// ── Create Product ────────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, discount, description, aboutThisProduct } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "name, category and price are required" });
    }

    if (!req.files?.mainImage) {
      return res.status(400).json({ success: false, message: "mainImage is required" });
    }

    const mainImageFile = req.files.mainImage[0];
    const uploaded = await uploadToCloudinary(mainImageFile.buffer, "vishwakarma/products");
    const mainImage = { url: uploaded.secure_url, publicId: uploaded.public_id };

    let galleryImages = [];
    if (req.files?.galleryImages) {
      const uploads = await Promise.all(
        req.files.galleryImages.map((f) => uploadToCloudinary(f.buffer, "vishwakarma/products"))
      );
      galleryImages = uploads.map((u) => ({ url: u.secure_url, publicId: u.public_id }));
    }

    const slug = await generateUniqueSlug(name);

    const product = await Product.create({
      name, slug, category, price, discount, description, aboutThisProduct, mainImage, galleryImages,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All Products ──────────────────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;
    const search   = req.query.search?.trim();
    const isActive = req.query.isActive;
    const category = req.query.category;

    const query = {};

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined && isActive !== "") query.isActive = isActive === "true";
    if (category) query.category = category;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Product By ID or Slug ─────────────────────────────────────────
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const product = isObjectId
      ? await Product.findById(id).populate("category", "name").populate("relatedProducts", "name price discount finalPrice mainImage category slug")
      : await Product.findOne({ slug: id }).populate("category", "name").populate("relatedProducts", "name price discount finalPrice mainImage category slug");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Product ────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, category, price, discount, description, aboutThisProduct, isActive } = req.body;

    if (name && name.trim() !== product.name) {
      product.name = name.trim();
      product.slug = await generateUniqueSlug(name, product._id);
    } else if (!product.slug) {
      product.slug = await generateUniqueSlug(product.name, product._id);
    }
    if (category)                      product.category          = category;
    if (price !== undefined)           product.price             = price;
    if (discount !== undefined)        product.discount          = discount;
    if (description !== undefined)     product.description       = description;
    if (aboutThisProduct !== undefined) product.aboutThisProduct = aboutThisProduct;
    if (isActive !== undefined)        product.isActive          = isActive === "true" || isActive === true;

    // Replace mainImage
    if (req.files?.mainImage) {
      if (product.mainImage?.publicId) {
        await cloudinary.uploader.destroy(product.mainImage.publicId);
      }
      const uploaded = await uploadToCloudinary(req.files.mainImage[0].buffer, "vishwakarma/products");
      product.mainImage = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }

    // Append galleryImages
    if (req.files?.galleryImages) {
      const uploads = await Promise.all(
        req.files.galleryImages.map((f) => uploadToCloudinary(f.buffer, "vishwakarma/products"))
      );
      const newImages = uploads.map((u) => ({ url: u.secure_url, publicId: u.public_id }));
      product.galleryImages = [...(product.galleryImages || []), ...newImages];
    }

    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Toggle Status ─────────────────────────────────────────────
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete Product ────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete all images from cloudinary
    const imagesToDelete = [];
    if (product.mainImage?.publicId) imagesToDelete.push(product.mainImage.publicId);
    product.galleryImages?.forEach((g) => { if (g.publicId) imagesToDelete.push(g.publicId); });

    await Promise.all(imagesToDelete.map((pid) => cloudinary.uploader.destroy(pid)));

    await product.deleteOne();

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
