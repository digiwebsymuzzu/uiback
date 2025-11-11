// models/Attribute.js
import mongoose from "mongoose";

// Subdocument schema for attribute items
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String },
  status: { type: Number, enum: [0, 1], default: 1 }, // 1 = Active, 0 = Inactive
}, { timestamps: true });

// Main Attribute schema
const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  status: { type: Number, enum: [0, 1], default: 1 }, // 1 = Active, 0 = Inactive
  items: [itemSchema], // Embedded items for configuration
}, { timestamps: true });

export default mongoose.model("Attribute", attributeSchema);