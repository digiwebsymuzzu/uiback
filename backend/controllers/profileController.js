import Profile from '../models/User.js';
import bcrypt from 'bcryptjs';

// GET profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[CONTROLLER] getProfile called with user id:', userId);

    const profile = await Profile.findById(userId);
    console.log('[CONTROLLER] Found profile:', profile);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error('[PROFILE GET ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /update profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[CONTROLLER] updateProfile called with user id:', userId);
    console.log('[CONTROLLER] Request body:', req.body);

    const updatedData = {};

    if (req.body.fullName !== undefined && req.body.fullName.trim() !== '') {
      updatedData.fullName = req.body.fullName;
    }
    if (req.body.email !== undefined && req.body.email.trim() !== '') {
      updatedData.email = req.body.email;
    }
    if (req.body.phone !== undefined && req.body.phone.trim() !== '') {
      updatedData.phone = req.body.phone;
    }
    if (req.body.address !== undefined && req.body.address.trim() !== '') {
      updatedData.address = req.body.address;
    }
    if (req.body.description !== undefined && req.body.description.trim() !== '') {
      updatedData.description = req.body.description;
    }

    // Hash password if provided
    if (req.body.password && req.body.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(req.body.password, salt);
    }

    console.log('[CONTROLLER] Final update object:', updatedData);

    const updatedProfile = await Profile.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    console.log('[CONTROLLER] Updated profile:', updatedProfile);

    res.status(200).json({ success: true, profile: updatedProfile });
  } catch (err) {
    console.error('[PROFILE UPDATE ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
};
