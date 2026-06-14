import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    profilePhoto: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },

      cloudinaryData: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    name: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
      index: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
    },

    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, "Invalid pincode"],
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    otp: {
      type: String,
      required: false,
    },

    expiresAt: {
      type: Date,
      required: false,
    },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound Indexes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ mobile: 1, isActive: 1 });
userSchema.index({ city: 1, state: 1 });

// Text Search
userSchema.index({
  name: "text",
  email: "text",
  city: "text",
  state: "text",
});

const User = mongoose.model("User", userSchema);

export default User;
