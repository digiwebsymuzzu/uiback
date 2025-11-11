import blogtagmodel from '../models/blogtagModels.js'

// ======================= CREATE BLOG =======================
export const createblogtag = async (req, res) => {
  try {
    let { tagname, tagslug, tagparagraph } = req.body

    // Input validation
    if (!tagname) {
      return res
        .status(400)
        .json({ message: 'Please provide a Tag Name', success: false, error: true })
    }
    if (!tagslug) {
      return res
        .status(400)
        .json({ message: 'Please provide a Tag URL.', success: false, error: true })
    }

    if (!tagparagraph) {
      return res
        .status(400)
        .json({ message: 'Please provide Tag Content.', success: false, error: true })
    }

    // Duplicate slug check
    const blogurlExists = await blogtagmodel.findOne({ tagslug })
    if (blogurlExists) {
      return res.status(409).json({
        message: 'This Tag URL already exists. Please try another one.',
        success: false,
        error: true,
      })
    }

    // Save blog
    const uploadBlog = new blogtagmodel({
      tagname,
      tagslug,
      tagparagraph,
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
export const getAlltag = async (req, res) => {
  try {
    const blogs = await blogtagmodel.find().sort({ createdAt: -1 }) // latest first
    res.status(200).json({
      data: blogs,
      success: true,
      error: false,
      message: 'Tag fetched successfully!',
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

export async function tagdelete(req, res) {
  try {
    const { id } = req.params

    const deletedBlog = await blogtagmodel.findByIdAndDelete(id)

    if (!deletedBlog) {
      return res.status(404).json({
        message: 'Tag not found',
        success: false,
        error: true,
      })
    }

    return res.json({
      message: 'Tag deleted successfully',
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

export const updatetag = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: true, message: 'Invalid Tag ID' })
    }

    // Destructure request body
    let { tagname, tagslug, tagparagraph } = req.body

    // Find category
    const categoryblog = await blogtagmodel.findById(id)
    if (!categoryblog) {
      return res.status(404).json({ success: false, error: true, message: 'Category not found' })
    }

    // VALIDATION
    if (!tagname || tagname.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide a Tag Name.' })
    }
    if (!tagslug || tagslug.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide a Tag Slug.' })
    }
    if (!tagparagraph || tagparagraph.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide Tag Content.' })
    }

    // Duplicate slug check
    const slugExists = await blogtagmodel.findOne({ slugurl: tagslug, _id: { $ne: id } })
    if (slugExists) {
      return res.status(409).json({
        success: false,
        error: true,
        message: 'This Tag Slug already exists. Please try another one.',
      })
    }

    // Update fields
    categoryblog.tagname = tagname.trim()
    categoryblog.tagslug = tagslug.trim()
    categoryblog.tagparagraph = tagparagraph.trim()

    const updatedCategory = await categoryblog.save()

    return res.status(200).json({
      data: updatedCategory,
      success: true,
      error: false,
      message: 'Tag updated successfully!',
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
