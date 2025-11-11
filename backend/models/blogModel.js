// models/blogModel.js
import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    blogtitle: {
      type: String,
      trim: true,
    },
    slugurl: {
      type: String,
      trim: true,
    },
    blogtags: {
      type: String,
      trim: true,
    },
    blogcategory: {
      type: String,
    },
    blogImage: {
      type: String, // URL or path
    },
    authorname: {
      type: String,
      trim: true,
    },
    blogdate: {
      type: Date,
      default: Date.now,
    },
    blogparagraph: {
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

const Blog = mongoose.model('Blog', blogSchema)

export default Blog
