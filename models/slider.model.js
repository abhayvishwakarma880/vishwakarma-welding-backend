import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    image: {
      url:      { type: String, required: true },
      publicId: { type: String, required: true },
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

sliderSchema.index({ createdAt: -1 });

const Slider = mongoose.model("Slider", sliderSchema);

export default Slider;
