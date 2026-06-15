import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoute from "./routes/user.route.js";
import categoryRoute from "./routes/category.route.js";
import adminRoute from "./routes/admin.route.js";
import productRoute from "./routes/product.route.js";
import galleryRoute from "./routes/gallery.route.js";
import contactRoute from "./routes/contact.route.js";
import sliderRoute from "./routes/slider.route.js";
import blogRoute      from "./routes/blog.route.js";
import wishlistRoute  from "./routes/wishlist.route.js";


const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "https://admin-vishwakarma-welding.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/users', userRoute)
app.use('/category', categoryRoute)
app.use('/admin', adminRoute)
app.use('/products', productRoute)
app.use('/gallery', galleryRoute)
app.use('/contact', contactRoute)
app.use('/slider', sliderRoute)
app.use('/blog',      blogRoute)
app.use('/wishlist',  wishlistRoute)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("DB Connection Failed:", error);
    process.exit(1);
  }
};

startServer();