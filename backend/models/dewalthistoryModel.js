import mongoose from 'mongoose'

const dewaltScheme = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    youtubeurl: {
      type: String,
      trim: true,
    },
    status: {
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
const Dewalt = mongoose.model('Dewaltyoutube', dewaltScheme)
export default Dewalt
