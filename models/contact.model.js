import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    service: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    projectLocation: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

contactSchema.index({ createdAt: -1 });
contactSchema.index({ name: "text", mobile: "text", email: "text", service: "text" });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
