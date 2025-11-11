// models/blogModel.js
import mongoose from 'mongoose'

const blogcategorySchema = new mongoose.Schema(
  {
    categoryname: {
      type: String,
      trim: true,
    },
    categoryslug: {
      type: String,
      trim: true,
    },

    categoryImage: {
      type: String, // URL or path
    },
    categoryparagraph: {
      type: String,
    },
    statusactiveinactive: {
      type: Number,
      enum: {
        values: [0, 1], // Accept 0 (inactive) or 1 (active)
        message: 'Status must be either 0 (inactive) or 1 (active).',
      },
      default: 0, // Default to 0 (inactive)
    },
  },

  {
    timestamps: true,
  },
)

const Blogcategory = mongoose.model('Blogcategory', blogcategorySchema)

export default Blogcategory
