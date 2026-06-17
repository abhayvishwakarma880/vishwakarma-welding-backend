import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const optionalUserAuth = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(); // Proceed as guest
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-otp -expiresAt");

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Account is deactivated.",
        });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore invalid token and proceed as guest
    next();
  }
};

export default optionalUserAuth;
