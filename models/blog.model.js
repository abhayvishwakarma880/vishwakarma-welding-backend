import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    image: {
      url:      { type: String, required: true },
      publicId: { type: String, required: true },
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    readTime: {
      type: Number,       // in minutes
      default: 1,
      min: 1,
    },

    tags: {
      type: [String],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    relatedBlogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],

    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

blogSchema.index({ createdAt: -1 });
blogSchema.index({ category: 1, isPublished: 1, isActive: 1 });
blogSchema.index({ title: "text", description: "text", tags: "text" });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
