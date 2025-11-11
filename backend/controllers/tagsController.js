import Tag from '../models/Tag.js';
import csvParser from "csv-parser";
import fs from "fs";

// GET all tags
export const getTags = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim();

    // Build query
    let query = {};
    if (search && search !== "") {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const total = await Tag.countDocuments(query);

    const tags = await Tag.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      data: tags,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET /api/tags error:", err);
    return res.status(500).json({ message: "Failed to fetch tags" });
  }
};

// POST new tag
export const addTag = async (req, res) => {
  try {
    const { name, slug, description, status } = req.body;

    // Require only "name"
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Create base slug (use provided slug OR fallback to name)
    let baseSlug =
      slug?.trim().toLowerCase().replace(/\s+/g, '-') ||
      name.trim().toLowerCase().replace(/\s+/g, '-');

    // Ensure unique slug
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Tag.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 🔥 Generate next term_id safely
    // Ignore documents without term_id, start from 8720 if none exist
    const lastTagWithTermId = await Tag.find({ term_id: { $exists: true } })
      .sort({ term_id: -1 })
      .limit(1);

    const nextTermId =
      lastTagWithTermId.length > 0
        ? lastTagWithTermId[0].term_id + 1
        : 8720;

    console.log('Next term_id:', nextTermId); // debug

    // Save tag
    const newTag = new Tag({
      name,
      slug: uniqueSlug,
      description: description || '',
      status: status !== undefined ? Number(status) : 1,
      term_id: nextTermId, // 👈 guaranteed unique
    });

    await newTag.save();

    return res.status(201).json({
      message: 'Tag added successfully',
      data: newTag,
    });
  } catch (err) {
    console.error('POST /api/tags error:', err);

    // Catch duplicate key error (MongoDB E11000)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug or term_id already exists' });
    }

    return res.status(500).json({ message: 'Failed to add tag' });
  }
};


// PUT update tag (Edit form)
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug, description, status } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Name is required' })
    }

    // Build base slug (use slug if provided, else generate from name)
    let baseSlug = slug?.trim().toLowerCase().replace(/\s+/g, '-') 
                || name.trim().toLowerCase().replace(/\s+/g, '-')

    // Ensure unique slug (ignore current tag’s slug)
    let uniqueSlug = baseSlug
    let counter = 1
    while (await Tag.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Update tag
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      {
        name,
        slug: uniqueSlug,
        description,
        status: status !== undefined ? Number(status) : 1,
      },
      { new: true }
    )

    if (!updatedTag) {
      return res.status(404).json({ message: 'Tag not found' })
    }

    return res.status(200).json({
      message: 'Tag updated successfully',
      data: updatedTag,
    })
  } catch (err) {
    console.error('PUT /api/tags/edit/:id error:', err)
    return res.status(500).json({ message: 'Failed to update tag' })
  }
}

// PUT update status (Status toggle)
export const updateTagStatus = async (req, res) => {
  try {
    const { id } = req.params
    let { status } = req.body

    if (status === undefined) return res.status(400).json({ message: 'Status is required' })

    // Ensure status is 0 or 1
    status = Number(status)
    if (![0, 1].includes(status)) return res.status(400).json({ message: 'Invalid status value' })

    const updatedTag = await Tag.findByIdAndUpdate(id, { status }, { new: true })

    if (!updatedTag) return res.status(404).json({ message: 'Tag not found' })

    res.status(200).json(updatedTag)
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
}

// DELETE single tag
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params
    const deletedTag = await Tag.findByIdAndDelete(id)

    if (!deletedTag) return res.status(404).json({ message: 'Tag not found' })

    res.status(200).json({ message: 'Tag deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error })
  }
}


export const importTags = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const cleanRow = {};
        Object.keys(row).forEach((k) => {
          const key = k.replace(/^\uFEFF/, "").trim(); // clean BOM + spaces
          cleanRow[key] = row[k]?.trim?.();
        });
        results.push(cleanRow);
      })
      .on("end", async () => {
        let inserted = 0;
        let updated = 0;

        console.log("First parsed row:", results[0]);

        for (const row of results) {
          try {
            const { term_id, name, slug, description } = row;

            if (!name || !slug) {
              console.warn("Skipping row, missing fields:", row);
              continue;
            }

            // check if slug already exists
            const existing = await Tag.findOne({ slug });

            if (existing) {
              await Tag.updateOne(
                { slug },
                {
                  term_id: term_id ? Number(term_id) : null,
                  name,
                  description: description || "",
                  status: 1,
                  updatedAt: new Date(),
                }
              );
              updated++;
            } else {
              await Tag.create({
                term_id: term_id ? Number(term_id) : null,
                name,
                slug,
                description: description || "",
                status: 1,
              });
              inserted++;
            }
          } catch (err) {
            console.error("Row import error:", row, err.message);
          }
        }

        fs.unlinkSync(filePath);

        return res.json({
          message: "Import completed",
          inserted,
          updated,
          totalRows: results.length,
        });
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err);
        return res.status(500).json({ message: "CSV parsing failed" });
      });
  } catch (err) {
    console.error("Import failed:", err);
    return res
      .status(500)
      .json({ message: "Import failed", error: err.message });
  }
};