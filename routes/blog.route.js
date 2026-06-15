import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.middleware.js";
import {
  createBlog, getAllBlogs, getPublishedBlogs,
  getBlogByIdOrSlug, updateBlog, toggleBlogStatus,
  toggleBlogPublished, deleteBlog, addComment, deleteComment,
} from "../controllers/blog.controller.js";

const blogRoute = express.Router();

// Public
blogRoute.get("/published",          getPublishedBlogs);
blogRoute.get("/:id",                getBlogByIdOrSlug);

// Admin
blogRoute.get("/",                   adminAuth, getAllBlogs);
blogRoute.post("/create",            adminAuth, upload.single("image"), createBlog);
blogRoute.put("/update/:id",         adminAuth, upload.single("image"), updateBlog);
blogRoute.patch("/toggle/:id",       adminAuth, toggleBlogStatus);
blogRoute.patch("/publish/:id",      adminAuth, toggleBlogPublished);
blogRoute.delete("/delete/:id",      adminAuth, deleteBlog);

// Comments
blogRoute.post("/:id/comments",                    addComment);           // public — logged in user
blogRoute.delete("/:id/comments/:commentId",  adminAuth, deleteComment); // admin only

export default blogRoute;
