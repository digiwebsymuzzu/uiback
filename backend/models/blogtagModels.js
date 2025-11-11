// models/blogModel.js
import mongoose from 'mongoose'

const blogtagSchema = new mongoose.Schema(
  {
    tagname: {
      type: String,
      trim: true,
    },
    tagslug: {
      type: String,
      trim: true,
    },
    tagparagraph: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
)

const Blogtag = mongoose.model('Blogtag', blogtagSchema)

export default Blogtag
