import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    brand_img: {
      type: String,
      default: '',
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    parentBrand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Brand', brandSchema);