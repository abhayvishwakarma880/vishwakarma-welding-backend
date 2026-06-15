import Blog     from "../models/blog.model.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import slugify from "../utils/slugify.js";

// ── Slug generator (unique) ───────────────────────────────────
const generateUniqueSlug = async (title, excludeId = null) => {
  let base = slugify(title);
  let slug = base;
  let count = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Blog.findOne(query).lean();
    if (!exists) break;
    slug = `${base}-${count++}`;
  }

  return slug;
};

// ── Create ────────────────────────────────────────────────────
export const createBlog = async (req, res) => {
  try {
    const { category, title, description, readTime, tags, relatedBlogs, isPublished } = req.body;

    if (!category?.trim()) return res.status(400).json({ success: false, message: "Category is required" });
    if (!title?.trim())    return res.status(400).json({ success: false, message: "Title is required" });
    if (!description?.trim()) return res.status(400).json({ success: false, message: "Description is required" });
    if (!req.file)         return res.status(400).json({ success: false, message: "Image is required" });

    const uploaded = await uploadToCloudinary(req.file.buffer, "vishwakarma/blogs");
    const image    = { url: uploaded.secure_url, publicId: uploaded.public_id };
    const slug     = await generateUniqueSlug(title);

    const parsedTags = tags
      ? (Array.isArray(tags) ? tags : JSON.parse(tags)).map((t) => t.trim()).filter(Boolean)
      : [];

    const parsedRelatedBlogs = relatedBlogs
      ? (Array.isArray(relatedBlogs) ? relatedBlogs : JSON.parse(relatedBlogs)).filter(Boolean)
      : [];

    const blog = await Blog.create({
      category,
      image,
      title: title.trim(),
      slug,
      description: description.trim(),
      readTime: readTime ? Number(readTime) : 1,
      tags: parsedTags,
      relatedBlogs: parsedRelatedBlogs,
      isPublished: isPublished === "true" || isPublished === true,
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All (admin — all blogs) ───────────────────────────────
export const getAllBlogs = async (req, res) => {
  try {
    const page        = parseInt(req.query.page)  || 1;
    const limit       = parseInt(req.query.limit) || 10;
    const skip        = (page - 1) * limit;
    const search      = req.query.search?.trim();
    const category    = req.query.category;
    const isPublished = req.query.isPublished;
    const isActive    = req.query.isActive;

    const query = {};

    if (category)                                          query.category    = category;
    if (isPublished !== undefined && isPublished !== "")  query.isPublished = isPublished === "true";
    if (isActive    !== undefined && isActive    !== "")  query.isActive    = isActive    === "true";

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags:        { $regex: search, $options: "i" } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Published (public — frontend) ────────────────────────
export const getPublishedBlogs = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;
    const category = req.query.category;
    const search   = req.query.search?.trim();

    const query = { isPublished: true, isActive: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags:        { $regex: search, $options: "i" } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      Blog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get By ID or Slug ─────────────────────────────────────────
export const getBlogByIdOrSlug = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const blog = isObjectId
      ? await Blog.findById(id).populate("category", "name").populate("relatedBlogs", "title slug image readTime")
      : await Blog.findOne({ slug: id }).populate("category", "name").populate("relatedBlogs", "title slug image readTime");

    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    // increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update ────────────────────────────────────────────────────
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const { category, title, description, readTime, tags, relatedBlogs, isPublished, isActive } = req.body;

    if (category)                  blog.category    = category;
    if (description !== undefined) blog.description = description.trim();
    if (readTime    !== undefined) blog.readTime    = Number(readTime);
    if (isPublished !== undefined) blog.isPublished = isPublished === "true" || isPublished === true;
    if (isActive    !== undefined) blog.isActive    = isActive    === "true" || isActive    === true;

    if (tags !== undefined) {
      blog.tags = (Array.isArray(tags) ? tags : JSON.parse(tags))
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (relatedBlogs !== undefined) {
      blog.relatedBlogs = (Array.isArray(relatedBlogs) ? relatedBlogs : JSON.parse(relatedBlogs))
        .filter(Boolean);
    }

    if (title && title.trim() !== blog.title) {
      blog.title = title.trim();
      blog.slug  = await generateUniqueSlug(title, blog._id);
    }

    if (req.file) {
      if (blog.image?.publicId) {
        await cloudinary.uploader.destroy(blog.image.publicId);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, "vishwakarma/blogs");
      blog.image = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }

    await blog.save();

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Toggle Status (isActive) ──────────────────────────────────
export const toggleBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    blog.isActive = !blog.isActive;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog ${blog.isActive ? "activated" : "deactivated"} successfully`,
      data: blog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Toggle Published ──────────────────────────────────────────
export const toggleBlogPublished = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    blog.isPublished = !blog.isPublished;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog ${blog.isPublished ? "published" : "unpublished"} successfully`,
      data: blog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Add Comment ──────────────────────────────────────────────
export const addComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const { comment, userId } = req.body;
    if (!comment?.trim()) return res.status(400).json({ success: false, message: "Comment is required" });

    blog.comments.push({
      userId: userId || null,
      comment: comment.trim(),
    });

    await blog.save();

    res.status(201).json({ success: true, data: blog.comments[blog.comments.length - 1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete Comment ────────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    comment.deleteOne();
    await blog.save();

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete ────────────────────────────────────────────────────
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    if (blog.image?.publicId) {
      await cloudinary.uploader.destroy(blog.image.publicId);
    }

    await blog.deleteOne();

    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
