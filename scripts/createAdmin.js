import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../models/admin.model.js";


dotenv.config();

const createAdmin = async () => {
try {
await mongoose.connect(process.env.MONGO_URI);


const email = "ankit@vishwakarma.com";
const plainPassword = "Ankit@123";

const existingAdmin = await Admin.findOne({ email });

if (existingAdmin) {
  console.log("❌ Admin already exists");
  process.exit(0);
}

const hashedPassword = await bcrypt.hash(plainPassword, 12);

await Admin.create({
  email,
  password: hashedPassword,
});

console.log("✅ Admin created successfully");
console.log("Email:", email);
console.log("Password:", plainPassword);

process.exit(0);

} catch (error) {
console.error("❌ Error creating admin:", error);
process.exit(1);
}
};

createAdmin();