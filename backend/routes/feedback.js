const express = require('express');
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const MenuItem = require('../models/MenuItem');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/feedback/menu/:menuItemId
// @desc    Add rating and feedback for a menu item
// @access  Private
router.post('/menu/:menuItemId', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.menuItemId)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    const menuItem = await MenuItem.findById(req.params.menuItemId);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }



    // Create feedback
    const feedback = new Feedback({
      user: req.user._id,
      menuItem: req.params.menuItemId,
      rating,
      comment,
      type: 'menu'
    });

    await feedback.save();

    // Update menu item ratings
    const allFeedbacks = await Feedback.find({ menuItem: req.params.menuItemId });
    const averageRating = allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length;

    await MenuItem.findByIdAndUpdate(req.params.menuItemId, {
      $set: {
        'ratings.average': averageRating,
        'ratings.count': allFeedbacks.length
      }
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        rating,
        comment,
        averageRating,
        totalRatings: allFeedbacks.length
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/menu/:menuItemId
// @desc    Get feedbacks for a menu item
// @access  Public
router.get('/menu/:menuItemId', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.menuItemId)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const feedbacks = await Feedback.find({ menuItem: req.params.menuItemId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ feedbacks });
  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/feedback/restaurant
// @desc    Add rating and feedback for the restaurant
// @access  Private
router.post('/restaurant', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
  body('category').optional().isIn(['Food Quality', 'Service', 'Ambiance', 'Online Order', 'Other', 'general']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment, category = 'general' } = req.body;



    // Create feedback (type: 'restaurant')
    const feedback = new Feedback({
      user: req.user._id,
      rating,
      comment,
      category,
      type: 'restaurant'
    });

    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Submit restaurant feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/restaurant/reviews
// @desc    Get top restaurant reviews (high rating, with comments)
// @access  Public
router.get('/restaurant/reviews', async (req, res) => {
  try {
    // Find feedbacks with comments and high ratings (4 or 5)
    // Populate user to get name and avatar
    const reviews = await Feedback.find({
      comment: { $exists: true, $ne: "" },
      rating: { $gte: 4 }
    })
    .sort({ rating: -1, createdAt: -1 })
    .limit(10) // Increased limit for better variety
    .populate('user', 'name avatar role');

    res.json({ reviews });
  } catch (error) {
    console.error('Get restaurant reviews error:', error);
    res.status(500).json({ message: 'Server error' }); 
  }
});


// @route   GET /api/feedback/restaurant
// @desc    Get feedbacks for the restaurant (general)
// @access  Public
router.get('/restaurant', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ type: 'restaurant' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ feedbacks });
  } catch (error) {
    console.error('Get restaurant feedbacks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

