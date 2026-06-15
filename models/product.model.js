import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    mainImage: imageSchema,

    galleryImages: {
      type: [imageSchema],
      default: [],
    },

    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    aboutThisProduct: {
      type: String,
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

// Indexes
productSchema.index({
  category: 1,
  isActive: 1,
});

productSchema.index({
  name: "text",
  description: "text",
});

// Virtual Discounted Price
productSchema.virtual("finalPrice").get(function () {
  return (
    this.price -
    (this.price * this.discount) / 100
  );
});

productSchema.set("toJSON", {
  virtuals: true,
});

const Product = mongoose.model(
  "Product",
  productSchema
);

export default Product;