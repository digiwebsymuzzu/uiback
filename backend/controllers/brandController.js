import Brand from '../models/Brand.js';

// ================== GET /api/brands ==================
export const getBrands = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const search = (req.query.search || '').trim();
    const status = req.query.status; // 0 | 1

    const sortByWhitelist = ['createdAt', 'updatedAt', 'name', 'slug'];
    const sortBy = sortByWhitelist.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status !== undefined && (status === '0' || status === '1')) {
      filter.status = Number(status);
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Brand.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Brand.countDocuments(filter),
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
    console.error('GET /api/brands error:', err);
    return res.status(500).json({ message: 'Failed to fetch brands' });
  }
};

// ================== POST /api/brands ==================
export const addBrand = async (req, res) => {
  try {
    const { name, slug, description, status, parentBrand } = req.body; 
    const brand_img = req.file ? req.file.filename : '';

    // 1. Generate unique slug
    let baseSlug = slug?.trim().toLowerCase().replace(/\s+/g, '-');
    if (!baseSlug && name) {
      baseSlug = name.trim().toLowerCase().replace(/\s+/g, '-');
    }

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Brand.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 2. Create brand
    const newBrand = new Brand({
      name,
      slug: uniqueSlug,
      description,
      parentBrand: parentBrand || null, 
      brand_img,
      status: status !== undefined ? Number(status) : 1, // default active
    });

    await newBrand.save();

    return res.status(201).json({
      message: 'Brand added successfully',
      data: newBrand,
    });
  } catch (err) {
    console.error('POST /api/brands error:', err);
    return res.status(500).json({ message: 'Failed to add brand' });
  }
};

// ================== PUT /api/brands/edit/:id ==================
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, status, parentBrand } = req.body;

    // Generate slug
    let baseSlug = slug?.trim().toLowerCase().replace(/\s+/g, '-');
    if (!baseSlug && name) {
      baseSlug = name.trim().toLowerCase().replace(/\s+/g, '-');
    }

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Brand.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const updateData = {
      name,
      slug: uniqueSlug,
      parentBrand: parentBrand || null,
      description,
      status: status !== undefined ? Number(status) : 1,
    };

    if (req.file) {
      updateData.brand_img = req.file.filename;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedBrand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    return res.json({
      message: 'Brand updated successfully',
      data: updatedBrand,
    });
  } catch (err) {
    console.error('PUT /api/brands/:id error:', err);
    return res.status(500).json({ message: 'Failed to update brand' });
  }
};


// ================== DELETE /api/brands/:id ==================
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Brand.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json({ message: 'Brand deleted successfully', deletedId: id });
  } catch (err) {
    console.error('Error deleting brand:', err);
    res.status(500).json({ message: 'Server error while deleting brand' });
  }
};

// ================== PUT /api/brands/:id (status update) ==================
export const updateBrandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.status !== undefined) {
      const num = Number(req.body.status);
      if (num !== 0 && num !== 1) {
        return res.status(400).json({ message: 'Invalid status value, must be 0 or 1' });
      }
      updates.status = num;
    }

    const brand = await Brand.findByIdAndUpdate(id, { $set: updates }, { new: true });

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    return res.json({ message: 'Brand status updated successfully', brand });
  } catch (err) {
    console.error('Update brand status error:', err);
    return res.status(500).json({ message: 'Server error while updating brand status' });
  }
};
