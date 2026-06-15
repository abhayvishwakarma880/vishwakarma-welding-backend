import express from "express";
import adminAuth from "../middleware/adminAuth.middleware.js";
import { createContact, getAllContacts, getContactById, updateContact, deleteContact } from "../controllers/contact.controller.js";

const contactRoute = express.Router();

contactRoute.post("/create",       createContact);                    // public — frontend form
contactRoute.get("/",              adminAuth, getAllContacts);
contactRoute.get("/:id",           adminAuth, getContactById);
contactRoute.put("/update/:id",    adminAuth, updateContact);
contactRoute.delete("/delete/:id", adminAuth, deleteContact);

export default contactRoute;
