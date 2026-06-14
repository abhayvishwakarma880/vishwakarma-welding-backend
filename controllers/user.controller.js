import generateToken from "../config/token.js";
import User from "../models/user.model.js";
import { generateOTP } from "../utils/generateOtp.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";

export const createUser = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      pincode,
      city,
      state,
      address,
    } = req.body;

    let profilePhoto = {};

    if (req.file) {
      const uploadedImage =
        await uploadToCloudinary(
          req.file.buffer,
          "vishwakarma/users"
        );

      profilePhoto = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
        cloudinaryData: uploadedImage,
      };
    }

    const user = await User.create({
      name,
      mobile,
      email,
      pincode,
      city,
      state,
      address,
      profilePhoto,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const {mobile} = req.body

    if(!mobile){
      return res.status(400).json({success:false, message:"mobile number is required"})
    }
    
    const user = await User.findOne({mobile, isActive:true})

    const otp = generateOTP()

    if(!user){
      const newUser = {
        mobile,
        otp,
        expiresAt:new Date(Date.now() + 5 * 60 * 1000)
      }
      
      await User.create(newUser)
      return res.status(201).json({
        success: true,
        message: "OTP sent successfully",
        data: newUser,
      })
    }
    
    await user.updateOne({otp:otp, expiresAt:new Date(Date.now() + 5 * 60 * 1000)})
    return res.status(201).json({success: true,message: "OTP sent successfully",data: user,})


  } catch (error) {
    console.error(error);
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const login = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile and OTP are required",
      });
    }

    const user = await User.findOne({ mobile })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.expiresAt && user.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await user.updateOne({ otp: null, expiresAt: null });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;
    const search   = req.query.search?.trim();
    const isActive = req.query.isActive;

    const query = {};

    if (search) {
      query.$or = [
        { name:   { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { email:  { $regex: search, $options: "i" } },
        { city:   { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined && isActive !== "") {
      query.isActive = isActive === "true";
    }

    const [users, total] = await Promise.all([
      User.find(query).select("-otp -expiresAt").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-otp -expiresAt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, pincode, city, state, address } = req.body;

    let profilePhoto = user.profilePhoto;

    if (req.file) {
      // Delete old photo from cloudinary if exists
      if (user.profilePhoto?.publicId) {
        await cloudinary.uploader.destroy(user.profilePhoto.publicId);
      }

      const uploadedImage = await uploadToCloudinary(req.file.buffer, "vishwakarma/users");

      profilePhoto = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
        cloudinaryData: uploadedImage,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { name, email, pincode, city, state, address, profilePhoto },
      { new: true, runValidators: true }
    ).select("-otp -expiresAt");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};