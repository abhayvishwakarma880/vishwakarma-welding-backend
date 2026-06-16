import mongoose from "mongoose";

const recentSideWorkSchema = new mongoose.Schema(
  {
    slug:             { type: String, required: true, unique: true, trim: true, index: true },
    title:            { type: String, required: true, trim: true },
    projectName:      { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription:  { type: String, default: "" },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },

    location: {
      pincode:  { type: String, default: "" },
      district: { type: String, default: "" },
      state:    { type: String, default: "" },
    },

    coverImage: {
      url:      { type: String, required: true },
      publicId: { type: String, required: true },
    },

    galleryImages: [
      {
        url:      { type: String },
        publicId: { type: String },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },

    servicesUsed:  [{ type: String }],
    materialsUsed: [{ type: String }],

    isActive:  { type: Boolean, default: true, index: true },
    featured:  { type: Boolean, default: false, index: true },

    relatedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "RecentSideWork", default: [] }],

    seoTitle:       { type: String, default: "" },
    seoDescription: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

recentSideWorkSchema.index({ createdAt: -1 });

const RecentSideWork = mongoose.model("RecentSideWork", recentSideWorkSchema);

export default RecentSideWork;
