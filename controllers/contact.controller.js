import Contact from "../models/contact.model.js";

// ── Create ────────────────────────────────────────────────────
export const createContact = async (req, res) => {
  try {
    const { name, mobile, email, service, projectLocation, message } = req.body;

    if (!name?.trim())   return res.status(400).json({ success: false, message: "Name is required" });
    if (!mobile?.trim()) return res.status(400).json({ success: false, message: "Mobile is required" });

    const contact = await Contact.create({ name, mobile, email, service, projectLocation, message });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get All ───────────────────────────────────────────────────
export const getAllContacts = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const skip   = (page - 1) * limit;
    const search = req.query.search?.trim();
    const isRead = req.query.isRead;

    const query = {};

    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: "i" } },
        { mobile:  { $regex: search, $options: "i" } },
        { email:   { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ];
    }

    if (isRead !== undefined && isRead !== "") query.isRead = isRead === "true";

    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get By ID ─────────────────────────────────────────────────
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update ────────────────────────────────────────────────────
export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

    const { name, mobile, email, service, projectLocation, message, isRead } = req.body;

    if (name            !== undefined) contact.name            = name;
    if (mobile          !== undefined) contact.mobile          = mobile;
    if (email           !== undefined) contact.email           = email;
    if (service         !== undefined) contact.service         = service;
    if (projectLocation !== undefined) contact.projectLocation = projectLocation;
    if (message         !== undefined) contact.message         = message;
    if (isRead          !== undefined) contact.isRead          = isRead === "true" || isRead === true;

    await contact.save();

    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete ────────────────────────────────────────────────────
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });

    await contact.deleteOne();

    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
