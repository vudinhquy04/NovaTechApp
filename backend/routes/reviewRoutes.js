const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product with filters
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { filter, sort } = req.query;

    let query = { product: productId };

    // Filter by rating
    if (filter === '5') {
      query.rating = 5;
    } else if (filter === 'with_images') {
      query.images = { $exists: true, $ne: [] };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'helpful') {
      sortOption = { helpfulCount: -1 };
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .sort(sortOption);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/product/:productId/stats
// @desc    Get review statistics for a product
// @access  Public
router.get('/product/:productId/stats', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: productId });
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          '5': 0,
          '4': 0,
          '3': 0,
          '2': 0,
          '1': 0
        }
      });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);

    // Calculate rating distribution
    const distribution = {
      '5': 0,
      '4': 0,
      '3': 0,
      '2': 0,
      '1': 0
    };

    reviews.forEach(review => {
      distribution[review.rating.toString()]++;
    });

    // Convert to percentages
    const ratingDistribution = {};
    Object.keys(distribution).forEach(rating => {
      ratingDistribution[rating] = Math.round((distribution[rating] / totalReviews) * 100);
    });

    res.json({
      averageRating: parseFloat(averageRating),
      totalReviews,
      ratingDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, orderId, rating, comment, images } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId,
      rating,
      comment,
      images: images || []
    });

    // Update product statistics
    await updateProductStats(productId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.put('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user._id.toString();
    const helpfulIndex = review.helpfulUsers.findIndex(
      id => id.toString() === userId
    );

    if (helpfulIndex > -1) {
      // User already marked as helpful, remove it
      review.helpfulUsers.splice(helpfulIndex, 1);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add user to helpful list
      review.helpfulUsers.push(req.user._id);
      review.helpfulCount += 1;
    }

    await review.save();
    res.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reviews/:id/reply
// @desc    Add reply to a review
// @access  Private
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.replies.push({
      user: req.user._id,
      comment
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('replies.user', 'name email');

    res.json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to update product statistics
async function updateProductStats(productId) {
  const reviews = await Review.find({ product: productId });
  const totalReviews = reviews.length;

  if (totalReviews === 0) return;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;

  const distribution = {
    '5': 0,
    '4': 0,
    '3': 0,
    '2': 0,
    '1': 0
  };

  reviews.forEach(review => {
    distribution[review.rating.toString()]++;
  });

  await Product.findByIdAndUpdate(productId, {
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews,
    ratingDistribution: distribution
  });
}

module.exports = router;
