import fs from 'fs';
import csvParser from 'csv-parser';
import Category from '../models/Category.js';
import path from 'path';


// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    // Query params
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim(); // 'Active' | 'Inactive'
    const sortByWhitelist = ['createdAt', 'updatedAt', 'name', 'slug', 'cat_id'];
    const sortBy = sortByWhitelist.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && ['Active', 'Inactive'].includes(status)) {
      filter.status = status;
    }

    // Optional: filter by parent (expects a number or 'null')
    if (req.query.cat_parent !== undefined && req.query.cat_parent !== '') {
      if (req.query.cat_parent === 'null') {
        filter.cat_parent = null;
      } else {
        const parentNum = Number(req.query.cat_parent);
        if (!Number.isNaN(parentNum)) filter.cat_parent = parentNum;
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Category.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(filter),
    ]);

    return res.json({
      data: items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
        sortBy,
        sortOrder: sortOrder === 1 ? 'asc' : 'desc',
        search: search || undefined,
        status: status || undefined,
      },
    });
  } catch (err) {
    console.error('GET /api/categories error: - categoryController.js:67', err);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};


// controllers/categoryController.js

export const addCategory = async (req, res) => {
  try {
    const { name, slug, description, cat_parent, cat_status, cat_superparent } = req.body;
    const cat_img = req.file ? req.file.filename : '';

    // === 1. Generate unique slug ===
    let baseSlug = slug?.trim().toLowerCase().replace(/\s+/g, '-');
    if (!baseSlug) {
      baseSlug = name.trim().toLowerCase().replace(/\s+/g, '-');
    }

    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await Category.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // === 2. Auto-increment cat_id ===
    const lastCategory = await Category.findOne({}).sort({ cat_id: -1 }).lean();
    const nextCatId = lastCategory ? lastCategory.cat_id + 1 : 8800;

    // === 3. Create new category ===
    const newCategory = new Category({
      cat_id: nextCatId,
      name,
      slug: uniqueSlug,
      description,
      cat_parent: cat_parent || null,
      cat_superparent: cat_superparent ? Number(cat_superparent) : 0,
      cat_img,
      cat_status: cat_status !== undefined ? Number(cat_status) : 1,
    });

    await newCategory.save();

    return res.status(201).json({
      message: 'Category added successfully',
      data: newCategory,
    });
  } catch (err) {
    console.error('POST /api/categories error: - categoryController.js:117', err);
    return res.status(500).json({ message: 'Failed to add category' });
  }
};

export const updateCategory = async (req, res) => {
  try {

     console.log('Incoming Payload - categoryController.js:125');
    console.log('req.body: - categoryController.js:126', req.body);
    if (req.file) {
      console.log('req.file: - categoryController.js:128', req.file);
    }
    console.log('');
    
    const { id } = req.params;
    const { name, slug, description, cat_parent, cat_status, cat_superparent } = req.body;

    // === 1. Generate base slug from slug or name ===
    let baseSlug = slug?.trim().toLowerCase().replace(/\s+/g, '-');
    if (!baseSlug && name) {
      baseSlug = name.trim().toLowerCase().replace(/\s+/g, '-');
    }

    let uniqueSlug = baseSlug;
    let counter = 1;

    // === 2. Ensure unique slug (excluding current category id) ===
    while (await Category.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // === 3. Build update object ===
    const updateData = {
      name,
      slug: uniqueSlug,
      description,
      cat_parent: cat_parent && cat_parent !== '' ? Number(cat_parent) : null,
      cat_status: cat_status !== undefined ? Number(cat_status) : 1,
      cat_superparent: cat_superparent === '1' || cat_superparent === 1 || cat_superparent === true ? 1 : 0,
    };

    if (req.file) {
      updateData.cat_img = req.file.filename;
    }

    // === 4. Update the category ===
    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (err) {
    console.error('PUT /api/categories/:id error: - categoryController.js:175', err);
    return res.status(500).json({ message: 'Failed to update category' });
  }
};


export const importCategories = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const cleanRow = {};
        Object.keys(row).forEach((k) => {
          const key = k.replace(/^\uFEFF/, '').trim();
          cleanRow[key] = row[k]?.trim?.();
        });
        results.push(cleanRow);
      })
      .on('end', async () => {
        let inserted = 0;
        let updated = 0;

        console.log('First parsed row: - categoryController.js:204', results[0]);

        for (const row of results) {
          try {
            const { cat_id, name, slug, description, cat_parent, cat_img, cat_status, cat_superparent_name } = row;

            if (!cat_id || !name || !slug) {
              console.warn('Skipping row, missing fields: - categoryController.js:211', row);
              continue;
            }

            const parentVal =
              cat_parent && !isNaN(cat_parent) ? Number(cat_parent) : null;

            const existing = await Category.findOne({ cat_id: Number(cat_id) });

            if (existing) {
              await Category.updateOne(
                { cat_id: Number(cat_id) },
                {
                  name,
                  slug,
                  description,
                  cat_parent: parentVal,
                  cat_img: cat_img || null,
                  cat_status,
                  cat_superparent_name,
                }
              );
              updated++;
            } else {
              await Category.create({
                cat_id: Number(cat_id),
                name,
                slug,
                description,
                cat_parent: parentVal,
                cat_img: cat_img || null,
                cat_status,
                cat_superparent_name,
              });
              inserted++;
            }
          } catch (err) {
            console.error('Row import error: - categoryController.js:248', row, err.message);
          }
        }

        fs.unlinkSync(filePath);

        return res.json({
          message: 'Import completed',
          inserted,
          updated,
          totalRows: results.length,
        });
      })
      .on('error', (err) => {
        console.error('CSV parse error: - categoryController.js:262', err);
        return res.status(500).json({ message: 'CSV parsing failed' });
      });
  } catch (err) {
    console.error('Import failed: - categoryController.js:266', err);
    return res.status(500).json({ message: 'Import failed', error: err.message });
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully', deletedId: id });
  } catch (error) {
    console.error('Error deleting category: - categoryController.js:284', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Whitelist allowed fields to update
    const allowed = ['name', 'slug', 'description', 'cat_parent', 'cat_img', 'cat_status'];
    const updates = {};

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    // Normalize/validate cat_status if provided
    if (updates.cat_status !== undefined) {
      const num = Number(updates.cat_status);
      if (num !== 0 && num !== 1) {
        return res.status(400).json({ message: 'Invalid cat_status value, must be 0 or 1' });
      }
      updates.cat_status = num;
    }

    const category = await Category.findByIdAndUpdate(id, { $set: updates }, { new: true });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ message: 'Category updated successfully', category });
  } catch (err) {
    console.error('Update category error: - categoryController.js:320', err);
    return res.status(500).json({ message: 'Server error while updating category' });
  }
}