const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  action: {
    type: String,
    enum: ['In', 'Out', 'Adjustment', 'Consumption', 'Waste', 'Return'],
    required: true
  },
  quantityChanged: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  referenceType: {
    type: String,
    enum: ['Order', 'Manual', 'Supplier', 'System'],
    default: 'Manual'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
