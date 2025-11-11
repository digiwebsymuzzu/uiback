// controllers/reviewController.js
import Review from '../models/Review.js'
import Product from '../models/Product.js'


export const getReviews = async (req, res) => {
  try {
    // Fetch all reviews
    const reviews = await Review.find().lean(); // convert to plain JS objects

    // Fetch product names for all unique productIds in reviews
    const productIds = [...new Set(reviews.map(r => r.productId.toString()))]; // unique IDs
    const products = await Product.find({ _id: { $in: productIds } }).select('productName').lean();

    // Map product names to reviews
    const reviewsWithProductName = reviews.map(r => {
      const product = products.find(p => p._id.toString() === r.productId.toString());
      return {
        ...r,
        productName: product ? product.productName : 'N/A'
      };
    });

    res.status(200).json({
      data: reviewsWithProductName,
      message: 'Reviews fetched successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✅ PATCH reply to a review
export const replyReview = async (req, res) => {
  try {
    const { id } = req.params
    const { reply } = req.body

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { reply },
      { new: true }
    )

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' })
    }

    res.status(200).json({ message: 'Reply added successfully', review: updatedReview })
  } catch (error) {
    res.status(500).json({ message: 'Failed to add reply', error })
  }
}

// ✅ DELETE a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params

    const deletedReview = await Review.findByIdAndDelete(id)

    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' })
    }

    res.status(200).json({ message: 'Review deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review', error })
  }
}