import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    cat_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    cat_parent: { type: Number, default: null },
    cat_img: { type: String, default: '' },
    cat_status: { type: Number, default: null },
    cat_superparent: { type: Number, default: 0 },
    cat_superparent_name: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);