const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Reservation = require('../models/Reservation');
const Inventory = require('../models/Inventory');
const { adminAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');

const router = express.Router();

// Simple in-memory cache for dashboard data
let dashboardCache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 30000; // 30 seconds

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const { period = '7d', forceRefresh = 'false' } = req.query;
    
    // Check cache
    const nowTime = Date.now();
    if (forceRefresh !== 'true' && dashboardCache.data && (nowTime - dashboardCache.timestamp < CACHE_DURATION)) {
      console.log('Returning cached dashboard data');
      return res.json(dashboardCache.data);
    }

    // Force fresh data on every request (no browser caching)
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '15d':
        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    }

    // Calculate real-time date ranges
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Get statistics
    const [
      totalOrders,
      totalRevenue,
      activeUsers,
      totalMenuItems,
      pendingOrders,
      completedOrders,
      totalReservations,
      recentOrders,
      topMenuItems,
      todayRevenue,
      todayOrders,
      lastHourOrders,
      lastHourRevenue,
      activeOrdersNow,
      preparingOrders,
      readyOrders,

      recentFeedbacks,
      revenueInPeriod,
      ordersInPeriod,
      newActiveCustomers,
      newMenuItems,
      lowStockItems
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      User.countDocuments({ isActive: true, role: 'customer' }),
      MenuItem.countDocuments({ 'availability.isAvailable': true }),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.countDocuments({ status: 'served' }),
      Reservation.countDocuments({}),
      Order.find({})
        .populate('customer', 'name email')
        .populate('items.menuItem', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      MenuItem.aggregate([
        { $match: { 'availability.isAvailable': true } },
        { $sort: { 'ratings.average': -1 } },
        { $limit: 5 },
        { $project: { name: 1, price: 1, ratings: 1, category: 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ createdAt: { $gte: lastHour } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastHour }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.countDocuments({ status: 'preparing' }),
      Order.countDocuments({ status: 'ready' }),
      require('../models/Feedback').find({})
        .populate('user', 'name avatar')
        .populate('menuItem', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      // Stats for trends (Growth in Period)
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ role: 'customer', isActive: true, createdAt: { $gte: startDate } }),
      MenuItem.countDocuments({ createdAt: { $gte: startDate } }),
      Inventory.countDocuments({ status: { $in: ['Low Stock', 'Out of Stock'] } })
    ]);



    // Get revenue by day for chart
    const revenueByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get live activity feed (orders from last 30 minutes)
    const last30Minutes = new Date(now.getTime() - 30 * 60 * 1000);
    const liveActivity = await Order.find({
      createdAt: { $gte: last30Minutes }
    })
      .populate('customer', 'name email')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .select('orderNumber customer items total status createdAt orderType')
      .lean();

    const responseData = {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeUsers,
        totalMenuItems,
        pendingOrders,
        completedOrders,
        totalReservations,
        todayRevenue: todayRevenue[0]?.total || 0,
        todayOrders,
        lastHourOrders,
        lastHourRevenue: lastHourRevenue[0]?.total || 0,
        activeOrdersNow,
        preparingOrders,
        readyOrders,
        // Trends
        revenueInPeriod: revenueInPeriod[0]?.total || 0,
        ordersInPeriod,
        newActiveCustomers,
        newMenuItems,
        lowStockItems
      },
      charts: {
        revenueByDay,
        orderStatusDistribution
      },
      recentOrders,
      topMenuItems,
      liveActivity,
      recentFeedbacks
    };


    // Update cache
    dashboardCache = {
      data: responseData,
      timestamp: nowTime
    };

    res.json(responseData);
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin only)
router.put('/users/:id/status', adminAuth, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (user && isActive !== undefined) {
      const statusText = isActive ? 'Activated' : 'Deactivated';
      const emailSubject = `Account ${statusText} - Garden Grains`;
      
      const emailContent = isActive 
        ? `
          <h2>Welcome Back!</h2>
          <p>Dear ${user.name},</p>
          <p>Your account has been <strong>activated</strong> by our administrators.</p>
          <p>You can now log in and access all features of Garden Grains.</p>
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL || '#'}/login" class="button">Login Now</a>
          </div>
        `
        : `
          <h2>Account Deactivated</h2>
          <p>Dear ${user.name},</p>
          <p>Your account has been <strong>deactivated</strong> by our administrators.</p>
          <p>If you believe this is a mistake, please contact our support team.</p>
        `;

      // Send email in background
      // Use setImmediate or catch to ensure we don't block response if email fails
      sendEmail(user.email, emailSubject, emailContent).catch(err => {
        console.error(`Failed to send account ${statusText} email to ${user.email}:`, err);
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics/sales
// @desc    Get sales analytics
// @access  Private (Admin only)
router.get('/analytics/sales', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let matchFilter = { paymentStatus: 'paid' };
    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'day':
        groupFormat = '%Y-%m-%d';
        break;
      case 'month':
        groupFormat = '%Y-%m';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const salesData = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top selling items
    const topSellingItems = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'menuItem' } },
      { $unwind: '$menuItem' },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
      { $project: { name: '$menuItem.name', quantitySold: 1, revenue: 1 } }
    ]);

    res.json({
      salesData,
      topSellingItems
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics/customers
// @desc    Get customer analytics
// @access  Private (Admin only)
router.get('/analytics/customers', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchFilter = {};
    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const customerAnalytics = await User.aggregate([
      { $match: { role: 'customer', ...matchFilter } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: { $sum: { $cond: ['$isActive', 1, 0] } },
          newCustomers: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0] } }
        }
      }
    ]);

    // Get customer loyalty distribution
    const loyaltyDistribution = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $bucket: {
          groupBy: '$loyaltyPoints',
          boundaries: [0, 100, 500, 1000, 2000, Infinity],
          default: '2000+',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      customerAnalytics: customerAnalytics[0] || { totalCustomers: 0, activeCustomers: 0, newCustomers: 0 },
      loyaltyDistribution
    });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/feedback
// @desc    Get all feedback/reviews
// @access  Private (Admin only)
router.get('/feedback', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, rating, category } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (rating) filter.rating = parseInt(rating);
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const feedback = await require('../models/Feedback').find(filter)
      .populate('user', 'name email avatar')
      .populate('menuItem', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await require('../models/Feedback').countDocuments(filter);

    res.json({
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

