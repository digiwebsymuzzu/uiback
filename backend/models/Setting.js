// models/Setting.js
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, default: '' },
    email: { type: String, required: true },
    website: { type: String, default: '' },
    address: { type: String, default: '' },
    tax: { type: String, default: '' },

    // Logo file path or URL
    logo: { type: String, default: '' },

    // Social links
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  { timestamps: true }
);

// 👇 Collection will be `settings`
export default mongoose.model('Setting', settingSchema);