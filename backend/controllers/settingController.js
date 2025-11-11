// controllers/settingController.js
import Setting from '../models/Setting.js';

// @desc    Get company settings
// @route   GET /api/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      // If not found, create a blank one
      settings = await Setting.create({
        name: '',
        mobile: '',
        email: '',
        website: '',
        address: '',
        tax: '',
        logo: '',
        linkedin: '',
        instagram: '',
        youtube: '',
        facebook: '',
        twitter: '',
      });
    }

    res.status(200).json({ success: true, settings });
  } catch (err) {
    console.error('[GET SETTINGS ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update company settings
// @route   POST /api/settings/update
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name || '',
      mobile: req.body.mobile || '',
      email: req.body.email || '',
      website: req.body.website || '',
      address: req.body.address || '',
      tax: req.body.tax || '',
      linkedin: req.body.linkedin || '',
      instagram: req.body.instagram || '',
      youtube: req.body.youtube || '',
      facebook: req.body.facebook || '',
      twitter: req.body.twitter || '',
    };

    if (req.file) {
      updateData.logo = `uploads/logo/${req.file.filename}`;
    }

    const settings = await Setting.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
    });

    res.status(200).json({ success: true, settings });
  } catch (err) {
    console.error('[UPDATE SETTINGS ERROR]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};