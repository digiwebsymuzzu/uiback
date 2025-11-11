import Attribute from "../models/Attribute.js";
import slugify from "slugify";
import fs from "fs";
import csv from "csv-parser";
// ------------------- Attribute Controllers -------------------

// @desc    Get all attributes
// @route   GET /api/attributes
export const getAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.find();
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single attribute by ID
// @route   GET /api/attributes/:id
export const getAttributeById = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) return res.status(404).json({ message: "Attribute not found" });

    res.json(attribute);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create new attribute
// @route   POST /api/attributes
export const createAttribute = async (req, res) => {
  try {
    let { name, slug, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Always generate slug from name
    let baseSlug = slugify(name, { lower: true, strict: true });
    let finalSlug = baseSlug;

    // Check if slug already exists, if yes append -1, -2 etc.
    let counter = 1;
    while (await Attribute.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const attribute = new Attribute({
      name,
      slug: finalSlug,
      status: status ?? 1,
    });

    await attribute.save();
    res.status(201).json(attribute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update attribute
// @route   PUT /api/attributes/:id
export const updateAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Generate slug from name
    let baseSlug = slugify(name, { lower: true, strict: true });
    let finalSlug = baseSlug;

    // Ensure uniqueness (exclude the current attribute id)
    let counter = 1;
    let existing = await Attribute.findOne({ slug: finalSlug, _id: { $ne: id } });
    while (existing) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
      existing = await Attribute.findOne({ slug: finalSlug, _id: { $ne: id } });
    }

    const updated = await Attribute.findByIdAndUpdate(
      id,
      { name, slug: finalSlug, status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    res.json(updated);
  } catch (error) {
    // Handle duplicate key error properly
    if (error.code === 11000) {
      return res.status(400).json({ message: "Slug already exists, please try again." });
    }
    res.status(500).json({ message: error.message });
  }
};


// @desc    Delete attribute
// @route   DELETE /api/attributes/:id
// Delete Attribute
export const deleteAttribute = async (req, res) => {
  try {
    const deleted = await Attribute.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    res.json({ message: "Attribute deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- Attribute Item Controllers -------------------

// @desc    Get all items for an attribute
// @route   GET /api/attributes/:attributeId/items
// ---------------- Get All Items for an Attribute ----------------
export const getItems = async (req, res) => {
  try {
    const { attributeId } = req.params;

    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    res.status(200).json(attribute.items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add new item to attribute
// @route   POST /api/attributes/:attributeId/items
// ------------------- Add Item to Attribute -------------------
// ---------------- Add Item to Attribute ----------------
export const addItem = async (req, res) => {
  try {
    const { attributeId } = req.params;
    let { name, slug, description, status } = req.body;

    // Find the parent attribute
    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    // If slug is not provided, generate from name
    let baseSlug =
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check against existing items in this attribute
    while (attribute.items.some((item) => item.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Push new item into items array
    const newItem = {
      name,
      slug: uniqueSlug,
      description,
      status: status ?? 1,
    };

    attribute.items.push(newItem);
    await attribute.save();

    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update item under attribute
// @route   PUT /api/attributes/:attributeId/items/:itemId
export const updateItem = async (req, res) => {
  try {
    const { attributeId, itemId } = req.params;
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Item name is required" });
    }

    // Find the attribute first
    const attribute = await Attribute.findById(attributeId);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    // Generate base slug
    let baseSlug = slugify(name, { lower: true, strict: true });
    let finalSlug = baseSlug;

    // Ensure uniqueness among items (excluding current item)
    let counter = 1;
    while (attribute.items.some(
      (item) => item.slug === finalSlug && item._id.toString() !== itemId
    )) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Find the item and update
    const itemIndex = attribute.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    attribute.items[itemIndex].name = name;
    attribute.items[itemIndex].slug = finalSlug;
    attribute.items[itemIndex].description = description || "";
    if (status !== undefined) {
      attribute.items[itemIndex].status = status;
    }

    await attribute.save();

    res.json(attribute.items[itemIndex]);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Slug already exists, please try again." });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete item from attribute
// @route   DELETE /api/attributes/:attributeId/items/:itemId
export const deleteItem = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.attributeId);
    if (!attribute) return res.status(404).json({ message: "Attribute not found" });

    const item = attribute.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.deleteOne();
    await attribute.save();

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// POST /api/attributes/:attributeId/import
export const importItemsFromCSV = async (req, res) => {
  try {
    const { attributeId } = req.params;
    if (!attributeId) return res.status(400).json({ message: "attributeId required" });

    const attribute = await Attribute.findById(attributeId);
    if (!attribute) return res.status(404).json({ message: "Attribute not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const rows = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        // Accept CSV with header "name" OR headerless (fallback to first column)
        const rawName = row.name ?? Object.values(row)[0];
        if (rawName !== undefined && rawName !== null) {
          rows.push({
            name: String(rawName).trim(),
            description: row.description ? String(row.description).trim() : "",
          });
        }
      })
      .on("end", async () => {
        try {
          let importedCount = 0;

          for (const r of rows) {
            const itemName = r.name;
            if (!itemName) continue;

            // skip case-insensitive duplicates by name
            if (attribute.items.some((i) => i.name.toLowerCase() === itemName.toLowerCase())) {
              continue;
            }

            // generate slug (same logic as your addItem)
            let baseSlug = itemName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            let uniqueSlug = baseSlug;
            let counter = 1;
            while (attribute.items.some((it) => it.slug === uniqueSlug)) {
              uniqueSlug = `${baseSlug}-${counter++}`;
            }

            attribute.items.push({
              name: itemName,
              slug: uniqueSlug,
              description: r.description || "",
              status: 1,
            });

            importedCount++;
          }

          // ensure Mongoose marks the modified array
          attribute.markModified("items");
          await attribute.save();

          // cleanup uploaded file
          try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }

          return res.json({
            message: "CSV imported successfully!",
            imported: importedCount,
            attribute: attribute.name,
          });
        } catch (saveErr) {
          console.error("Import save error:", saveErr);
          return res.status(500).json({ message: "Error saving imported items", error: saveErr.message });
        }
      })
      .on("error", (parseErr) => {
        console.error("CSV parse error:", parseErr);
        return res.status(500).json({ message: "Error parsing CSV", error: parseErr.message });
      });
  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};