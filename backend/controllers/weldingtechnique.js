import weldingModel from '../models/weldingtechniqueModel.js'

export const createwelding = async (req, res) => {
  try {
    let { title, youtubeurl, status } = req.body

    // Input Validation

    if (!title) {
      return res
        .status(400)
        .json({ message: 'Please provide a Title.', success: false, error: true })
    }
    if (!youtubeurl) {
      return res
        .status(400)
        .json({ message: 'Plz Provide a Youtube Url', success: false, error: true })
    }
    // Handle statusactiveinactive
    if (status === 'inactive' || status === 0 || status === '0') {
      status = 0
    } else {
      // by default active (1)
      status = 1
    }

    // Duplicate Url check
    const urlExist = await weldingModel.findOne({ youtubeurl })
    if (urlExist) {
      return res.status(400).json({
        message: 'This URL already exists. Please try another one.',
        success: false,
        error: true,
      })
    }
    // URL validation
    // Basic URL regex (http or https required)
    const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i
    if (!urlRegex.test(youtubeurl)) {
      return res.status(400).json({
        message: 'Invalid URL. Please enter a valid link.',
        success: false,
        error: true,
      })
    }

    // Save blog
    const uploaddewalt = new weldingModel({
      title,
      youtubeurl,
      status,
    })

    const savedewalt = await uploaddewalt.save()
    res.status(201).json({
      data: savedewalt,
      success: true,
      error: false,
      message: 'Dewalt History created successfully!',
    })
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Internal server error.',
      error: true,
      success: false,
    })
  }
}

// ======================= GET ALL Youtube =======================
export const getallwelding = async (req, res) => {
  try {
    const dewalt = await weldingModel.find().sort({ createdAt: -1 }) // latest first
    res.status(200).json({
      data: dewalt,
      success: true,
      error: false,
      message: 'Dewalt fetched successfully!',
    })
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Internal server error.',
      error: true,
      success: false,
    })
  }
}
// ======================= Delete Youtube =======================

export const deletewelding = async (req, res) => {
  try {
    const { id } = req.params

    const deleteyoutube = await weldingModel.findByIdAndDelete(id)

    if (!deleteyoutube) {
      return res.status(404).json({
        message: 'Video not found',
        success: false,
        error: true,
      })
    }

    // ✅ Success response
    return res.status(200).json({
      message: 'Video deleted successfully',
      success: true,
      error: false,
    })
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Internal server error.',
      success: false,
      error: true,
    })
  }
}
// ======================= UPDATE Category =======================
export const updatewelding = async (req, res) => {
  try {
    const { id } = req.params

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, error: true, message: 'Invalid ID' })
    }

    let { title, youtubeurl, status } = req.body

    // Validate required fields
    if (!title) {
      return res
        .status(400)
        .json({ message: 'Please provide a Title.', success: false, error: true })
    }
    if (!youtubeurl) {
      return res
        .status(400)
        .json({ message: 'Please provide a Youtube URL.', success: false, error: true })
    }

    // Status normalization
    if (status === 'inactive' || status === 0 || status === '0') {
      status = 0
    } else {
      status = 1
    }

    // Find record
    const categoryblog = await weldingModel.findById(id)
    if (!categoryblog) {
      return res.status(404).json({ message: 'Video not found', success: false, error: true })
    }

    // Duplicate URL check excluding current record
    const urlExist = await weldingModel.findOne({ youtubeurl, _id: { $ne: id } })
    if (urlExist) {
      return res
        .status(400)
        .json({ message: 'This URL already exists.', success: false, error: true })
    }

    // URL validation
    const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i
    if (!urlRegex.test(youtubeurl)) {
      return res.status(400).json({ message: 'Invalid URL.', success: false, error: true })
    }

    // Update fields
    categoryblog.title = title.trim()
    categoryblog.youtubeurl = youtubeurl.trim()
    categoryblog.status = status

    const updatedCategory = await categoryblog.save()

    return res.status(200).json({
      data: updatedCategory,
      success: true,
      error: false,
      message: 'Video updated successfully!',
    })
  } catch (err) {
    console.error('Error updating video:', err)
    return res.status(500).json({
      success: false,
      error: true,
      message: err.message || 'Internal server error.',
    })
  }
}
// Update blog status
export const updateweldingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const video = await weldingModel.findById(id)
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' })
    }

    video.status = status === 1 ? 1 : 0
    await video.save()

    // ✅ return 200 and consistent success
    return res.status(200).json({
      success: true,
      data: video,
      message: 'Blog status updated successfully!',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
