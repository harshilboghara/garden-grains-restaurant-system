const express = require('express');
const { body, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

const logInventoryChange = async ({ item, action, quantityChanged, previousQuantity, referenceType = 'Manual', referenceId = null, user = null, reason = '' }) => {
  try {
    const log = new InventoryLog({
      inventoryItem: item._id,
      action,
      quantityChanged,
      previousQuantity,
      newQuantity: item.quantity,
      referenceType,
      referenceId,
      user,
      reason
    });
    await log.save();
  } catch (error) {
    console.error('Inventory logging failed:', error);
  }
};

// @route   GET /api/inventory/logs
// @desc    Get inventory logs
// @access  Private (Admin only)
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const { item, action, limit = 50 } = req.query;
    const filter = {};
    if (item) filter.inventoryItem = item;
    if (action) filter.action = action;

    const logs = await InventoryLog.find(filter)
      .populate('inventoryItem', 'name unit')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { category, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await Inventory.find(filter).sort(sortOptions);
    res.json(items);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory
// @desc    Add new inventory item
// @access  Private (Admin only)
router.post('/', adminAuth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('costPrice').isNumeric().withMessage('Cost price must be a number'),
  body('unit').notEmpty().withMessage('Unit is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = new Inventory(req.body);
    await item.save();

    await logInventoryChange({
      item,
      action: 'In',
      quantityChanged: item.quantity,
      previousQuantity: 0,
      user: req.user._id,
      reason: 'Initial creation'
    });

    res.status(201).json({
      message: 'Inventory item added successfully',
      item
    });
  } catch (error) {
    console.error('Add inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const oldItem = await Inventory.findById(req.params.id);
    if (!oldItem) return res.status(404).json({ message: 'Item not found' });

    const previousQuantity = oldItem.quantity;
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastRestocked: req.body.quantity > previousQuantity ? Date.now() : oldItem.lastRestocked },
      { new: true, runValidators: true }
    );

    if (item.quantity !== previousQuantity) {
      await logInventoryChange({
        item,
        action: item.quantity > previousQuantity ? 'In' : 'Out',
        quantityChanged: Math.abs(item.quantity - previousQuantity),
        previousQuantity,
        user: req.user._id,
        reason: 'Manual update'
      });
    }

    res.json({
      message: 'Inventory item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/inventory/:id/stock
// @desc    Update stock quantity
// @access  Private (Admin only)
router.patch('/:id/stock', adminAuth, [
  body('adjustment').isNumeric().withMessage('Adjustment must be a number')
], async (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const previousQuantity = item.quantity;
    item.quantity += adjustment;
    if (adjustment > 0) {
      item.lastRestocked = Date.now();
    }
    
    await item.save();

    await logInventoryChange({
      item,
      action: adjustment > 0 ? 'In' : 'Out',
      quantityChanged: Math.abs(adjustment),
      previousQuantity,
      user: req.user._id,
      reason: reason || 'Quick adjustment'
    });

    res.json({
      message: 'Stock updated successfully',
      item
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
