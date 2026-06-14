import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    image: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound Index
categorySchema.index({
  name: 1,
  isActive: 1,
});

// Text Search
categorySchema.index({
  name: "text",
  description: "text",
});

// Transform Response
categorySchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Category = mongoose.model(
  "Category",
  categorySchema
);

export default Category;