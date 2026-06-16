import RecentSideWork from "../models/recentSideWork.model.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// ── helpers ──────────────────────────────────────────────────
const destroyImage = async (publicId) => {
  if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
};

// ── Create ────────────────────────────────────────────────────
export const createRecentSideWork = async (req, res) => {
  try {
    if (!req.files?.coverImage?.[0]) {
      return res.status(400).json({ success: false, message: "Cover image is required" });
    }

    const {
      slug, title, projectName, shortDescription, fullDescription,
      categoryId, pincode, district, state,
      status, servicesUsed, materialsUsed,
      isActive, featured, seoTitle, seoDescription,
    } = req.body;

    // upload cover
    const cover = await uploadToCloudinary(req.files.coverImage[0].buffer, "vishwakarma/sideworks/covers");
    const coverImage = { url: cover.secure_url, publicId: cover.public_id };

    // upload gallery images (optional)
    let galleryImages = [];
    if (req.files?.galleryImages?.length) {
      const uploads = await Promise.all(
        req.files.galleryImages.map((f) => uploadToCloudinary(f.buffer, "vishwakarma/sideworks/gallery"))
      );
      galleryImages = uploads.map((u) => ({ url: u.secure_url, publicId: u.public_id }));
    }

    const work = await RecentSideWork.create({
      slug, title, projectName, shortDescription,
      fullDescription: fullDescription || "",
      categoryId: categoryId || null,
      location: { pincode: pincode || "", district: district || "", state: state || "" },
      coverImage,
      galleryImages,
      status: status || "completed",
      servicesUsed:  Array.isArray(servicesUsed)  ? servicesUsed  : servicesUsed  ? [servicesUsed]  : [],
      materialsUsed: Array.isArray(materialsUsed) ? materialsUsed : materialsUsed ? [materialsUsed] : [],
      relatedProjects: (() => { const v = req.body.relatedProjects; return Array.isArray(v) ? v : v ? [v] : []; })(),
      isActive:  isActive  !== undefined ? isActive  === "true" || isActive  === true : true,
      featured:  featured  !== undefined ? featured  === "true" || featured  === true : false,
      seoTitle:       seoTitle       || "",
      seoDescription: seoDescription || "",
    });

    res.status(201).json({ success: true, data: work });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All ───────────────────────────────────────────────────
export const getAllRecentSideWorks = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;

    const query = {};
    if (req.query.isActive !== undefined && req.query.isActive !== "")
      query.isActive = req.query.isActive === "true";
    if (req.query.status)   query.status   = req.query.status;
    if (req.query.featured !== undefined && req.query.featured !== "")
      query.featured = req.query.featured === "true";
    if (req.query.search)
      query.$or = [
        { title:       { $regex: req.query.search, $options: "i" } },
        { projectName: { $regex: req.query.search, $options: "i" } },
      ];

    const [works, total] = await Promise.all([
      RecentSideWork.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate("categoryId", "name")
        .select("-fullDescription"),
      RecentSideWork.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: works,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get By Slug ───────────────────────────────────────────────
export const getRecentSideWorkBySlug = async (req, res) => {
  try {
    const work = await RecentSideWork.findOne({ slug: req.params.slug })
      .populate("categoryId", "name")
      .populate("relatedProjects", "title slug coverImage shortDescription location status");
    if (!work) return res.status(404).json({ success: false, message: "Work not found" });
    res.status(200).json({ success: true, data: work });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get By ID ─────────────────────────────────────────────────
export const getRecentSideWorkById = async (req, res) => {
  try {
    const work = await RecentSideWork.findById(req.params.id)
      .populate("categoryId", "name")
      .populate("relatedProjects", "title slug coverImage shortDescription location status");
    if (!work) return res.status(404).json({ success: false, message: "Work not found" });
    res.status(200).json({ success: true, data: work });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update ────────────────────────────────────────────────────
export const updateRecentSideWork = async (req, res) => {
  try {
    const work = await RecentSideWork.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: "Work not found" });

    const {
      slug, title, projectName, shortDescription, fullDescription,
      categoryId, pincode, district, state,
      status, servicesUsed, materialsUsed,
      isActive, featured, seoTitle, seoDescription,
      removeGalleryIds,
    } = req.body;

    if (slug !== undefined)             work.slug             = slug;
    if (title !== undefined)            work.title            = title;
    if (projectName !== undefined)      work.projectName      = projectName;
    if (shortDescription !== undefined) work.shortDescription = shortDescription;
    if (fullDescription !== undefined)  work.fullDescription  = fullDescription;
    if (categoryId !== undefined)       work.categoryId       = categoryId || null;
    if (pincode  !== undefined)         work.location.pincode  = pincode;
    if (district !== undefined)         work.location.district = district;
    if (state    !== undefined)         work.location.state    = state;
    if (status !== undefined)           work.status           = status;
    if (seoTitle !== undefined)         work.seoTitle         = seoTitle;
    if (seoDescription !== undefined)   work.seoDescription   = seoDescription;
    if (req.body.relatedProjects !== undefined) {
      const v = req.body.relatedProjects;
      work.relatedProjects = Array.isArray(v) ? v : v ? [v] : [];
    }
    if (isActive !== undefined)         work.isActive = isActive === "true" || isActive === true;
    if (featured !== undefined)         work.featured = featured === "true" || featured === true;

    if (servicesUsed !== undefined)
      work.servicesUsed  = Array.isArray(servicesUsed)  ? servicesUsed  : servicesUsed  ? [servicesUsed]  : [];
    if (materialsUsed !== undefined)
      work.materialsUsed = Array.isArray(materialsUsed) ? materialsUsed : materialsUsed ? [materialsUsed] : [];

    // replace cover image
    if (req.files?.coverImage?.[0]) {
      await destroyImage(work.coverImage?.publicId);
      const cover = await uploadToCloudinary(req.files.coverImage[0].buffer, "vishwakarma/sideworks/covers");
      work.coverImage = { url: cover.secure_url, publicId: cover.public_id };
    }

    // remove gallery images
    if (removeGalleryIds) {
      const ids = Array.isArray(removeGalleryIds) ? removeGalleryIds : [removeGalleryIds];
      await Promise.all(ids.map(destroyImage));
      work.galleryImages = work.galleryImages.filter((g) => !ids.includes(g.publicId));
    }

    // add new gallery images
    if (req.files?.galleryImages?.length) {
      const uploads = await Promise.all(
        req.files.galleryImages.map((f) => uploadToCloudinary(f.buffer, "vishwakarma/sideworks/gallery"))
      );
      work.galleryImages.push(...uploads.map((u) => ({ url: u.secure_url, publicId: u.public_id })));
    }

    await work.save();
    res.status(200).json({ success: true, data: work });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Toggle Status (isActive) ──────────────────────────────────
export const toggleRecentSideWorkStatus = async (req, res) => {
  try {
    const work = await RecentSideWork.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: "Work not found" });
    work.isActive = !work.isActive;
    await work.save();
    res.status(200).json({
      success: true,
      message: `Work ${work.isActive ? "activated" : "deactivated"} successfully`,
      data: work,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete ────────────────────────────────────────────────────
export const deleteRecentSideWork = async (req, res) => {
  try {
    const work = await RecentSideWork.findById(req.params.id);
    if (!work) return res.status(404).json({ success: false, message: "Work not found" });

    await destroyImage(work.coverImage?.publicId);
    await Promise.all(work.galleryImages.map((g) => destroyImage(g.publicId)));
    await work.deleteOne();

    res.status(200).json({ success: true, message: "Work deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
