// routes/attributeRoutes.js
import express from "express";
import {
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,

  getItems,
  addItem,
  updateItem,
  deleteItem,
} from "../controllers/attributeController.js";

const router = express.Router();

// ------------------- Attribute Routes -------------------
router.get("/", getAttributes);             // GET all attributes
router.get("/:id", getAttributeById);       // GET single attribute
router.post("/", createAttribute);          // POST create new attribute
router.put("/:id", updateAttribute);        // PUT update attribute
router.delete("/:id", deleteAttribute);     // DELETE attribute

// ------------------- Attribute Item Routes -------------------
router.get("/:attributeId/items", getItems);                   // GET all items for attribute
router.post("/:attributeId/items", addItem);                   // POST add item to attribute
router.put("/:attributeId/items/:itemId", updateItem);         // PUT update item
router.delete("/:attributeId/items/:itemId", deleteItem);      // DELETE item

export default router;