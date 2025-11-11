import blogModel from '../models/blogModel.js'

// ======================= CREATE BLOG =======================
export const createBlogPost = async (req, res) => {
  try {
    let {
      blogtitle,
      slugurl,
      blogtags,
      blogcategory,
      authorname,
      blogdate,
      blogparagraph,
      statusactiveinactive,
    } = req.body

    // Input validation
    if (!blogtitle) {
      return res
        .status(400)
        .json({ message: 'Please provide a Blog Title.', success: false, error: true })
    }
    if (!slugurl) {
      return res
        .status(400)
        .json({ message: 'Please provide a Blog URL.', success: false, error: true })
    }
    if (!blogtags) {
      return res
        .status(400)
        .json({ message: 'Please provide Blog Tags.', success: false, error: true })
    }
    if (!blogcategory) {
      return res
        .status(400)
        .json({ message: 'Please provide Blog Category.', success: false, error: true })
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'Please provide a Blog Image.', success: false, error: true })
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
    if (!authorname) {
      return res
        .status(400)
        .json({ message: 'Please provide an Author Name.', success: false, error: true })
    }
    if (!blogdate) {
      return res
        .status(400)
        .json({ message: 'Please provide a Date.', success: false, error: true })
    }
    if (!blogparagraph) {
      return res
        .status(400)
        .json({ message: 'Please provide Blog Content.', success: false, error: true })
    }

    // Handle statusactiveinactive

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
    const blogurlExists = await blogModel.findOne({ slugurl })
    if (blogurlExists) {
      return res.status(409).json({
        message: 'This blog URL already exists. Please try another one.',
        success: false,
        error: true,
      })
    }

    // Save blog
    const uploadBlog = new blogModel({
      blogtitle,
      slugurl,
      blogtags,
      blogcategory,
      blogImage: req.file ? `/uploads/blogs/${req.file.filename}` : '', // ✅
      authorname,
      blogdate,
      blogparagraph,
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
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find().sort({ createdAt: -1 }) // latest first
    res.status(200).json({
      data: blogs,
      success: true,
      error: false,
      message: 'Blogs fetched successfully!',
    })
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Internal server error.',
      error: true,
      success: false,
    })
  }
}

// ======================= Delete BLOGS =======================

export async function blogdelete(req, res) {
  try {
    const { id } = req.params

    const deletedBlog = await blogModel.findByIdAndDelete(id)

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
// ======================= UPDATE BLOG =======================

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: true, message: 'Invalid Blog ID' })
    }

    // Destructure request body
    let {
      blogtitle,
      slugurl,
      blogtags,
      blogcategory,
      authorname,
      blogdate,
      blogparagraph,
      statusactiveinactive,
    } = req.body

    // Check if blog exists
    const blog = await blogModel.findById(id)
    if (!blog) {
      return res.status(404).json({ success: false, error: true, message: 'Blog not found' })
    }

    // --- VALIDATION ---
    if (!blogtitle || blogtitle.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide a Blog Title.' })
    }
    if (!slugurl || slugurl.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide a Blog URL.' })
    }
    if (!blogtags || blogtags.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide Blog Tags.' })
    }
    if (!blogcategory || blogcategory.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide Blog Category.' })
    }
    if (req.file) {
      blog.blogImage = `/uploads/blogs/${req.file.filename}`
    }
    if (!authorname || authorname.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide an Author Name.' })
    }
    if (!blogdate || isNaN(new Date(blogdate).getTime())) {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide a valid Date.' })
    }
    if (!blogparagraph || blogparagraph.trim() === '') {
      return res
        .status(400)
        .json({ success: false, error: true, message: 'Please provide Blog Content.' })
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

    // --- Duplicate slug check (ignore current blog) ---
    const slugExists = await blogModel.findOne({ slugurl, _id: { $ne: id } })
    if (slugExists) {
      return res.status(409).json({
        success: false,
        error: true,
        message: 'This blog URL already exists. Please try another one.',
      })
    }

    // --- Update blog fields ---
    blog.blogtitle = blogtitle.trim()
    blog.slugurl = slugurl.trim()
    blog.blogtags = blogtags.trim()
    blog.blogcategory = blogcategory.trim()
    blog.authorname = authorname.trim()
    blog.blogdate = new Date(blogdate)
    blog.blogparagraph = blogparagraph.trim()
    blog.statusactiveinactive = statusactiveinactive

    // Only replace image if a new file is uploaded
    if (req.file) {
      blog.blogImage = `/uploads/blogs/${req.file.filename}`
    }

    const updatedBlog = await blog.save()

    return res.status(200).json({
      data: updatedBlog,
      success: true,
      error: false,
      message: 'Blog updated successfully!',
    })
  } catch (err) {
    console.error('Error updating blog:', err)
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || 'Internal server error.',
    })
  }
}

// ======================= Status Change =======================

// Update blog status
export const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // expect 0 or 1

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: true, message: 'Invalid Blog ID' })
    }

    // Validate status
    if (status !== 0 && status !== 1) {
      return res.status(400).json({ success: false, error: true, message: 'Invalid status value' })
    }

    const blog = await blogModel.findById(id)
    if (!blog) {
      return res.status(404).json({ success: false, error: true, message: 'Blog not found' })
    }

    blog.statusactiveinactive = status
    const updatedBlog = await blog.save()

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Blog status updated successfully!',
      data: updatedBlog,
    })
  } catch (err) {
    console.error('Error updating blog status:', err)
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || 'Internal server error',
    })
  }
}
