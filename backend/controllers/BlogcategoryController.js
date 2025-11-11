import blogcategoryModel from '../models/blogcategoryModel.js'

// ======================= CREATE BLOG =======================
export const createblogcategory = async (req, res) => {
  try {
    let { categoryname, categoryslug, categoryparagraph, statusactiveinactive } = req.body

    // Input validation
    if (!categoryname) {
      return res
        .status(400)
        .json({ message: 'Please provide a Category Name', success: false, error: true })
    }
    if (!categoryslug) {
      return res
        .status(400)
        .json({ message: 'Please provide a Category URL.', success: false, error: true })
    }
    if (!req.file) {
      return res.status(400).json({
        message: 'Please provide a Category Image.',
        success: false,
        error: true,
      })
    }

    // ✅ Check MIME type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: 'Only image files (jpeg, jpg, png) are allowed.',
        success: false,
        error: true,
      })
    }
    if (!categoryparagraph) {
      return res
        .status(400)
        .json({ message: 'Please provide Category Content.', success: false, error: true })
    }

    // Handle statusactiveinactive
    if (
      statusactiveinactive === 'inactive' ||
      statusactiveinactive === 0 ||
      statusactiveinactive === '0'
    ) {
      statusactiveinactive = 0
    } else {
      // by default active (1)
      statusactiveinactive = 1
    }

    // Duplicate slug check
    const blogurlExists = await blogcategoryModel.findOne({ categoryslug })
    if (blogurlExists) {
      return res.status(409).json({
        message: 'This Category URL already exists. Please try another one.',
        success: false,
        error: true,
      })
    }

    // Save blog
    const uploadBlog = new blogcategoryModel({
      categoryname,
      categoryslug,
      categoryImage: req.file ? `/uploads/categoryblogs/${req.file.filename}` : '', // ✅
      categoryparagraph,
      statusactiveinactive,
    })

    const saveBlog = await uploadBlog.save()

    res.status(201).json({
      data: saveBlog,
      success: true,
      error: false,
      message: 'Blog created successfully!',
    })
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Internal server error.',
      error: true,
      success: false,
    })
  }
}
// ======================= GET ALL BLOGS =======================
export const getAllCategory = async (req, res) => {
  try {
    const blogs = await blogcategoryModel.find().sort({ createdAt: -1 }) // latest first
    res.status(200).json({
      data: blogs,
      success: true,
      error: false,
      message: 'Category fetched successfully!',
    })
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Internal server error.',
      error: true,
      success: false,
    })
  }
}
// ======================= Delete Category =======================

export async function categorydelete(req, res) {
  try {
    const { id } = req.params

    const deletedBlog = await blogcategoryModel.findByIdAndDelete(id)

    if (!deletedBlog) {
      return res.status(404).json({
        message: 'Blog not found',
        success: false,
        error: true,
      })
    }

    return res.json({
      message: 'Blog deleted successfully',
      success: true,
      error: false,
    })
  } catch (err) {
    return res.status(500).json({
      message: err.message || 'An error occurred while deleting the blog',
      success: false,
      error: true,
    })
  }
}
// ======================= UPDATE Category =======================

export const updatecategory = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: true, message: 'Invalid Category ID' })
    }

    // Destructure request body
    let { categoryname, categoryslug, categoryparagraph, statusactiveinactive } = req.body

    // Find category
    const categoryblog = await blogcategoryModel.findById(id)
    if (!categoryblog) {
      return res.status(404).json({ success: false, error: true, message: 'Category not found' })
    }

    // VALIDATION
    if (!categoryname || categoryname.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide a Category Name.' })
    }
    if (!categoryslug || categoryslug.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide a Category Slug.' })
    }
    if (!categoryparagraph || categoryparagraph.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide Category Content.' })
    }
    // --- Status normalization ---
    if (
      statusactiveinactive === 'inactive' ||
      statusactiveinactive === 0 ||
      statusactiveinactive === '0'
    ) {
      statusactiveinactive = 0
    } else {
      statusactiveinactive = 1
    }

    // Duplicate slug check
    const slugExists = await blogcategoryModel.findOne({ slugurl: categoryslug, _id: { $ne: id } })
    if (slugExists) {
      return res.status(409).json({
        success: false,
        error: true,
        message: 'This Category Slug already exists. Please try another one.',
      })
    }

    // Update fields
    categoryblog.categoryname = categoryname.trim()
    categoryblog.categoryslug = categoryslug.trim()
    categoryblog.categoryparagraph = categoryparagraph.trim()
    categoryblog.statusactiveinactive = statusactiveinactive

    // Update image if new file uploaded
    if (req.file) {
      categoryblog.categoryImage = `/uploads/categoryblogs/${req.file.filename}`
    }

    const updatedCategory = await categoryblog.save()

    return res.status(200).json({
      data: updatedCategory,
      success: true,
      error: false,
      message: 'Category updated successfully!',
    })
  } catch (err) {
    console.error('Error updating category:', err)
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || 'Internal server error.',
    })
  }
}
// Update blog status
export const updatecategoryStatus = async (req, res) => {
  try {
    const { id } = req.params
    let { statusactiveinactive } = req.body // will be string "0" or "1"

    // Convert to number
    statusactiveinactive = Number(statusactiveinactive)

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: true, message: 'Invalid Category ID' })
    }

    // Validate status (only 0 or 1 allowed)
    if (![0, 1].includes(statusactiveinactive)) {
      return res.status(400).json({ success: false, error: true, message: 'Invalid status value' })
    }

    const categoryblog = await blogcategoryModel.findById(id)
    if (!categoryblog) {
      return res.status(404).json({ success: false, error: true, message: 'Category not found' })
    }

    categoryblog.statusactiveinactive = statusactiveinactive
    const updatedCategory = await categoryblog.save()

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Category status updated successfully!',
      data: updatedCategory,
    })
  } catch (err) {
    console.error('Error updating Category status:', err)
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || 'Internal server error',
    })
  }
}
