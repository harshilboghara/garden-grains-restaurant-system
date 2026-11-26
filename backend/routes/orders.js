const express = require('express');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');
const Discount = require('../models/Discount');
const { auth, adminAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');

const router = express.Router();

const deductStockForOrder = async (order) => {
  try {
    for (const item of order.items) {
      // Find menu item with recipe
      const menuItem = await MenuItem.findById(item.menuItem).populate('recipe.inventoryItem');
      if (menuItem && menuItem.recipe && menuItem.recipe.length > 0) {
        for (const ingredient of menuItem.recipe) {
          const inventoryItem = await Inventory.findById(ingredient.inventoryItem);
          if (inventoryItem) {
            const deduction = ingredient.quantity * item.quantity;
            const previousQuantity = inventoryItem.quantity;
            
            inventoryItem.quantity -= deduction;
            await inventoryItem.save();

            // Log the deduction
            const log = new InventoryLog({
              inventoryItem: inventoryItem._id,
              action: 'Consumption',
              quantityChanged: deduction,
              previousQuantity,
              newQuantity: inventoryItem.quantity,
              referenceType: 'Order',
              referenceId: order._id,
              reason: `Order #${order.orderNumber} - ${menuItem.name}`
            });
            await log.save();
          }
        }
      }
    }
  } catch (error) {
    console.error('Inventory deduction failed:', error);
  }
};

const restockForCancelledOrder = async (order) => {
  try {
    // Check if stock was previously deducted (look for logs)
    const logs = await InventoryLog.find({ referenceId: order._id, referenceType: 'Order', action: 'Consumption' });
    if (logs.length === 0) return;

    for (const log of logs) {
      const inventoryItem = await Inventory.findById(log.inventoryItem);
      if (inventoryItem) {
        const previousQuantity = inventoryItem.quantity;
        inventoryItem.quantity += log.quantityChanged;
        await inventoryItem.save();

        const newLog = new InventoryLog({
          inventoryItem: inventoryItem._id,
          action: 'Return',
          quantityChanged: log.quantityChanged,
          previousQuantity,
          newQuantity: inventoryItem.quantity,
          referenceType: 'Order',
          referenceId: order._id,
          reason: `Cancelled Order #${order.orderNumber}`
        });
        await newLog.save();
      }
    }
  } catch (error) {
    console.error('Inventory restocking failed:', error);
  }
};

/**
 * Helper to generate a premium dark-themed invoice PDF buffer
 */
const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- PREMIUM STYLE: DARK THEME ---
      const bgColor = '#0B0F14';
      const goldColor = '#D4AF37';
      const textColor = '#E2E8F0';
      const mutedColor = '#718096';
      const borderColor = '#2A2F38';

      // Fill Background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(bgColor);

      // Header Logo & Branding
      const logoPath = path.resolve(__dirname, '../../frontend/src/assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60 });
      }

      doc.fillColor(goldColor).fontSize(28).font('Helvetica-Bold').text('GARDEN GRAINS', 120, 50);
      doc.fillColor(mutedColor).fontSize(10).font('Helvetica').text('CURATED ORGANIC DINING • SIGNATURE EXPERIENCE', 120, 80);
      
      // Invoice Label
      doc.fillColor(goldColor).fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
      doc.fillColor(textColor).fontSize(12).font('Helvetica').text(`#${order.orderNumber}`, 400, 75, { align: 'right' });

      // Divider
      doc.moveTo(50, 110).lineTo(545, 110).strokeColor(borderColor).lineWidth(1).stroke();

      // Info Grid
      let infoY = 135;
      doc.fillColor(mutedColor).fontSize(8).font('Helvetica-Bold').text('BILL TO', 50, infoY);
      doc.fillColor(mutedColor).fontSize(8).font('Helvetica-Bold').text('ORDER DETAILS', 350, infoY);

      doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text(order.customer?.name || 'Valued Guest', 50, infoY + 15);
      doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text('DATE:', 350, infoY + 15);
      doc.font('Helvetica').text(new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), 400, infoY + 15);

      doc.fillColor(mutedColor).fontSize(10).font('Helvetica').text(order.customer?.email || '', 50, infoY + 35);
      doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text('TYPE:', 350, infoY + 35);
      doc.font('Helvetica').text(order.orderType.toUpperCase(), 400, infoY + 35);

      doc.fillColor(mutedColor).text(order.customer?.phone || '', 50, infoY + 50);
      doc.fillColor(textColor).fontSize(10).font('Helvetica-Bold').text('PAYMENT:', 350, infoY + 50);
      doc.font('Helvetica').text(order.paymentMethod.toUpperCase(), 415, infoY + 50);

      // Items Table Header
      let tableY = 220;
      doc.rect(50, tableY, 495, 30).fill(borderColor);
      doc.fillColor(goldColor).fontSize(9).font('Helvetica-Bold').text('CULLINARY SELECTION', 65, tableY + 11);
      doc.text('QTY', 300, tableY + 11, { width: 50, align: 'center' });
      doc.text('UNIT PRICE', 350, tableY + 11, { width: 90, align: 'right' });
      doc.text('TOTAL', 450, tableY + 11, { width: 80, align: 'right' });

      // Table Content
      let y = tableY + 45;
      order.items.forEach((item) => {
        if (y > 700) { doc.addPage(); doc.rect(0, 0, doc.page.width, doc.page.height).fill(bgColor); y = 50; }
        doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text(item.menuItem?.name || item.name || 'Artisanal Preparation', 65, y);
        doc.fillColor(textColor).fontSize(11).font('Helvetica').text(item.quantity.toString(), 300, y, { width: 50, align: 'center' });
        doc.text(`₹${item.price.toFixed(2)}`, 350, y, { width: 90, align: 'right' });
        doc.fillColor(goldColor).font('Helvetica-Bold').text(`₹${(item.price * item.quantity).toFixed(2)}`, 450, y, { width: 80, align: 'right' });
        if (item.customization && item.customization.length > 0) {
          y += 15;
          item.customization.forEach(c => {
            const choices = c.selectedChoices.map(ch => ch.name).join(', ');
            doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text(`+ ${c.optionName}: ${choices}`, 75, y);
            y += 12;
          });
          y -= 5;
        }
        y += 20;
        doc.moveTo(65, y).lineTo(530, y).strokeColor(borderColor).lineWidth(0.5).stroke();
        y += 15;
      });

      // Totals
      if (y > 650) { doc.addPage(); doc.rect(0, 0, doc.page.width, doc.page.height).fill(bgColor); y = 50; }
      let summaryX = 350;
      doc.fillColor(mutedColor).fontSize(10).font('Helvetica').text('SUBTOTAL:', summaryX, y);
      doc.fillColor(textColor).text(`₹${order.subtotal.toFixed(2)}`, 450, y, { width: 80, align: 'right' });
      y += 18;
      doc.fillColor(mutedColor).text('GST (18%):', summaryX, y);
      doc.fillColor(textColor).text(`₹${order.tax.toFixed(2)}`, 450, y, { width: 80, align: 'right' });
      if (order.deliveryFee > 0) {
        y += 18;
        doc.fillColor(mutedColor).text('DELIVERY:', summaryX, y);
        doc.fillColor(textColor).text(`₹${order.deliveryFee.toFixed(2)}`, 450, y, { width: 80, align: 'right' });
      }
      if (order.discount > 0) {
        y += 18;
        doc.fillColor('#48BB78').text('DISCOUNT:', summaryX, y);
        doc.text(`-₹${order.discount.toFixed(2)}`, 450, y, { width: 80, align: 'right' });
      }
      y += 25;
      doc.rect(340, y, 205, 45).fill(borderColor);
      doc.fillColor(goldColor).fontSize(12).font('Helvetica-Bold').text('GRAND TOTAL', 355, y + 16);
      doc.fontSize(18).text(`₹${order.total.toFixed(2)}`, 425, y + 13, { width: 110, align: 'right' });

      // Footer
      doc.moveTo(50, 750).lineTo(545, 750).strokeColor(borderColor).stroke();
      doc.fillColor(mutedColor).fontSize(8).font('Helvetica-Oblique').text('ELECTRONICALLY GENERATED INVOICE • GARDEN GRAINS RESTAURANT SYSTEM', 0, 765, { align: 'center', width: doc.page.width });
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.menuItem').isMongoId().withMessage('Invalid menu item ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('orderType').isIn(['dine-in', 'takeaway', 'delivery']).withMessage('Invalid order type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, orderType, deliveryAddress, notes, customerDetails, paymentMethod: manualPaymentMethod, paymentStatus: manualPaymentStatus, discountCode } = req.body;
    
    let customerId = req.user._id;
    let customerName = req.user.name;
    let customerEmail = req.user.email;

    // Admin can create order for a customer by providing details
    if (req.user.role === 'admin' && customerDetails && customerDetails.email) {
      let customerUser = await User.findOne({ email: customerDetails.email.toLowerCase() });
      
      if (!customerUser) {
        // Create a new user for this customer if they don't exist
        customerUser = new User({
          name: customerDetails.name || 'Walk-in Customer',
          email: customerDetails.email.toLowerCase(),
          phone: customerDetails.phone || '0000000000',
          password: Math.random().toString(36).slice(-8), // Random password
          role: 'customer',
          isActive: true
        });
        await customerUser.save();
      }
      
      customerId = customerUser._id;
      customerName = customerUser.name;
      customerEmail = customerUser.email;
    }

    // Batch fetch all menu items at once
    const menuItemIds = items.map(item => item.menuItem);
    const foundMenuItems = await MenuItem.find({ _id: { $in: menuItemIds } }).lean();
    const menuItemsMap = foundMenuItems.reduce((acc, item) => {
      acc[item._id.toString()] = item;
      return acc;
    }, {});

    let subtotal = 0;
    const orderItems = [];

    // Process items using the pre-fetched map
    for (const item of items) {
      const menuItem = menuItemsMap[item.menuItem];
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not found` });
      }

      if (!menuItem.availability?.isAvailable && req.user.role !== 'admin') {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      }

      let itemPrice = menuItem.price;
      
      // Add customization costs
      if (item.customization && item.customization.length > 0) {
        for (const custom of item.customization) {
          if (custom.selectedChoices) {
            for (const choice of custom.selectedChoices) {
              itemPrice += choice.price || 0;
            }
          }
        }
      }

      const totalItemPrice = itemPrice * item.quantity;
      subtotal += totalItemPrice;

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: itemPrice,
        customization: item.customization || [],
        specialInstructions: item.specialInstructions,
        name: menuItem.name // Cache name for easier bill generation
      });
    }

    // Apply a promo code. The amount is recalculated here from the stored
    // discount rules - the client's own discountAmount is never trusted - and
    // checked with the same rules as POST /api/discounts/validate.
    let discount = 0;
    let appliedDiscount = null;
    if (discountCode) {
      const now = new Date();
      appliedDiscount = await Discount.findOne({
        code: String(discountCode).toUpperCase(),
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now }
      });
      if (!appliedDiscount) {
        return res.status(400).json({ message: 'Invalid or expired discount code' });
      }
      if (appliedDiscount.usageLimit && appliedDiscount.usedCount >= appliedDiscount.usageLimit) {
        return res.status(400).json({ message: 'Discount code has reached its usage limit' });
      }
      if (subtotal < appliedDiscount.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount of ₹${appliedDiscount.minOrderAmount} required for this discount`
        });
      }
      if (appliedDiscount.discountType === 'percentage') {
        discount = (subtotal * appliedDiscount.discountValue) / 100;
        if (appliedDiscount.maxDiscountAmount) {
          discount = Math.min(discount, appliedDiscount.maxDiscountAmount);
        }
      } else {
        discount = appliedDiscount.discountValue;
      }
      discount = Math.min(Math.round(discount * 100) / 100, subtotal);
    }

    // Calculate totals (GST on the discounted amount, as shown at checkout)
    const taxable = subtotal - discount;
    const tax = taxable * 0.18; // 18% GST
    const deliveryFee = orderType === 'delivery' ? 50 : 0;
    const total = taxable + tax + deliveryFee;

    // Create order
    const order = new Order({
      customer: customerId,
      items: orderItems,
      subtotal,
      tax,
      discount,
      deliveryFee,
      total,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      notes,
      paymentMethod: manualPaymentMethod || 'online',
      paymentStatus: manualPaymentStatus || 'pending',
      status: req.user.role === 'admin' ? 'confirmed' : 'pending' // Admin orders auto-confirm
    });
    await order.save();
    if (appliedDiscount) {
      await Discount.updateOne({ _id: appliedDiscount._id }, { $inc: { usedCount: 1 } });
    }
    
    // Admin orders are auto-confirmed, so deduct stock immediately
    if (req.user.role === 'admin') {
      await deductStockForOrder(order);
    }
    
    // Emit socket event for new order
    try {
      const socketIO = require('../socket').getIO();
      const notificationData = {
        orderNumber: order.orderNumber,
        customerName: customerName,
        total: order.total,
        orderType: order.orderType
      };
      
      socketIO.to('admin_room').emit('new_order', notificationData);
      socketIO.emit('check_new_order_global', notificationData);
      
    } catch (socketError) {
      console.error('Socket notification failed:', socketError);
    }
    
    console.log('Order created successfully:', order.orderNumber);

    // Generate HTML for the bill
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #2A2F38;">
          <div style="font-weight: bold; color: #FFFFFF;">${item.name}</div>
          ${item.customization?.map(c => `<div style="font-size: 11px; color: #718096;">${c.optionName}: ${c.selectedChoices.map(ch => ch.name).join(', ')}</div>`).join('') || ''}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #2A2F38; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #2A2F38; text-align: right; font-family: monospace;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #2A2F38; text-align: right; font-family: monospace;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const billHtml = `
      <div style="background-color: #1A1F26; border: 1px solid #2A2F38; border-radius: 8px; padding: 25px; margin: 20px 0;">
        <h3 style="color: #D4AF37; margin-top: 0; text-align: center; border-bottom: 1px dashed #2A2F38; padding-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">Invoice #${order.orderNumber}</h3>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; font-size: 14px;">
          <thead>
            <tr style="color: #718096; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
              <th align="left" style="padding-bottom: 10px;">Item</th>
              <th align="center" style="padding-bottom: 10px;">Qty</th>
              <th align="right" style="padding-bottom: 10px;">Price</th>
              <th align="right" style="padding-bottom: 10px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-top: 2px solid #2A2F38; padding-top: 15px; font-size: 14px;">
          <tr>
            <td style="padding: 5px 0; color: #718096;">Subtotal</td>
            <td align="right" style="padding: 5px 0; color: #FFFFFF; font-family: monospace;">₹${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #718096;">Tax (GST 18%)</td>
            <td align="right" style="padding: 5px 0; color: #FFFFFF; font-family: monospace;">₹${tax.toFixed(2)}</td>
          </tr>
          ${deliveryFee > 0 ? `
          <tr>
            <td style="padding: 5px 0; color: #718096;">Delivery Fee</td>
            <td align="right" style="padding: 5px 0; color: #FFFFFF; font-family: monospace;">₹${deliveryFee.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 15px 0 5px; color: #D4AF37; font-weight: bold; font-size: 18px; border-top: 1px dashed #2A2F38;">Total</td>
            <td align="right" style="padding: 15px 0 5px; color: #D4AF37; font-weight: bold; font-size: 22px; font-family: monospace; border-top: 1px dashed #2A2F38;">₹${total.toFixed(2)}</td>
          </tr>
        </table>

        <div style="margin-top: 25px; text-align: center; color: #718096; font-size: 11px;">
          Payment Method: <span style="color: #FFFFFF; font-weight: bold; text-transform: uppercase;">${order.paymentMethod}</span> | 
          Status: <span style="color: ${order.paymentStatus === 'paid' ? '#48BB78' : '#F6AD55'}; font-weight: bold; text-transform: uppercase;">${order.paymentStatus}</span>
        </div>
      </div>
    `;

    const backendUrl = `${req.protocol}://${req.get('host')}`;

    try {
      // Re-fetch and populate for full details in invoice
      const populatedOrder = await Order.findById(order._id)
        .populate('customer', 'name email phone')
        .populate('items.menuItem', 'name price');

      // Generate PDF Invoice
      const pdfBuffer = await generateInvoicePDF(populatedOrder);

      // Send order confirmation email to customer with attachment - Background
      sendEmail(
        customerEmail,
        `Order Confirmation - ${order.orderNumber}`,
        `
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #FFFFFF; margin-bottom: 10px;">Thank You for Your Order!</h2>
          <p style="color: #A0AEC0;">Hello ${customerName}, we've received your order and are preparing it with care. Your official invoice is attached to this email.</p>
        </div>
        
        ${billHtml}

        <div class="highlight">
          <p><strong>Order Type:</strong> ${order.orderType}</p>
          <p><strong>Estimated Time:</strong> ${order.estimatedTime} minutes</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${(process.env.FRONTEND_URL || '').replace(/\/$/, '')}/orders" class="button" style="margin: 10px; display: inline-block;">Track Order</a>
          <a href="${backendUrl}/api/orders/invoice/${order._id}" class="button" style="margin: 10px; display: inline-block; background-color: transparent; border: 2px solid #D4AF37; color: #D4AF37 !important;">View Online Invoice</a>
        </div>

        <p style="text-align: center; color: #718096; font-size: 12px; margin-top: 30px;">
          If you have any questions about your order, please call us at +1 (555) 123-4567.
        </p>
        `,
        [
          {
            filename: `Invoice-${order.orderNumber}.pdf`,
            content: pdfBuffer
          }
        ]
      ).catch(emailError => console.error('Delayed customer email error:', emailError));

      // Notify admin(s) - Background
      User.find({ role: 'admin', isActive: true }).select('name email')
        .then(adminUsers => {
          if (adminUsers?.length > 0) {
            const adminEmails = adminUsers.map(admin => admin.email);
            sendEmail(
              adminEmails,
              `New Order Placed - ${order.orderNumber}`,
              `
              <h2>New Order Received</h2>
              <p>Hello Admin,</p>
              <p>A new order has been placed and requires attention.</p>
              <div class="highlight">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color: #E2E8F0;">
                  <tr><td style="padding: 4px 0; color: #A0AEC0;">Order #:</td><td style="padding: 4px 0; font-weight: 600; color: #FFFFFF;">${order.orderNumber}</td></tr>
                  <tr><td style="padding: 4px 0; color: #A0AEC0;">Customer:</td><td style="padding: 4px 0; font-weight: 600; color: #FFFFFF;">${customerName}</td></tr>
                  <tr><td style="padding: 4px 0; color: #A0AEC0;">Amount:</td><td style="padding: 4px 0; font-weight: 600; color: #D4AF37;">₹${total.toFixed(2)}</td></tr>
                  <tr><td style="padding: 4px 0; color: #A0AEC0;">Type:</td><td style="padding: 4px 0; font-weight: 600; color: #FFFFFF;">${order.orderType}</td></tr>
                </table>
              </div>
              <div class="button-container"><a href="${process.env.FRONTEND_URL || '#'}/admin/orders" class="button">Manage Order</a></div>
              `
            ).catch(e => console.error('Admin notification error:', e));
          }
        });

    } catch (backgroundError) {
      console.error('Post-save processing error:', backgroundError);
      // We don't return 500 here because the order IS saved, but we'll log it
    }

    res.status(201).json({
      message: 'Order created successfully. Invoice sent to email.',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        estimatedTime: order.estimatedTime
      }
    });
  } catch (error) {
    console.error('CRITICAL: Create order error:', error);
    res.status(500).json({ 
      message: 'Failed to create order. Please check backend logs.',
      error: error.message 
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { customer: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name price images description')
      .populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes, kitchenNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: Admin can do anything.
    // Customer can only change status to 'cancelled' if they own the order.
    if (req.user.role !== 'admin') {
      // Handle both populated and unpopulated customer field
      const orderCustomerId = order.customer._id ? order.customer._id.toString() : order.customer.toString();
      const isOwner = orderCustomerId === req.user._id.toString();
      
      // Case-insensitive status check
      const isCancelling = status?.toLowerCase() === 'cancelled';

      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied. You can only cancel your own orders.' });
      }

      if (!isCancelling) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required for this status.' });
      }

      // Business logic: Cannot cancel if order is already being processed
      if (['preparing', 'ready', 'served'].includes(order.status)) {
        return res.status(400).json({ message: 'Cannot cancel order that is already being prepared or served' });
      }
    }

    // Capture notes if provided as 'notes' or 'kitchenNotes'
    const statusNotes = notes || kitchenNotes;

    const oldStatus = order.status;
    order.status = status;
    if (statusNotes) order.kitchenNotes = statusNotes;

    await order.save();
    await order.populate('customer', 'name email');

    // Inventory management
    if ((status === 'confirmed' || status === 'preparing') && (oldStatus === 'pending')) {
      // Deduct stock when order starts being processed
      await deductStockForOrder(order);
    } else if (status === 'cancelled' && oldStatus !== 'cancelled') {
      // Return stock if cancelled
      await restockForCancelledOrder(order);
    }

    // Send socket notification for status updates (specifically for cancellation)
    try {
      const socketIO = require('../socket').getIO();
      const notificationData = {
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        status: order.status,
        total: order.total
      };

      if (status === 'cancelled') {
        console.log(`[Order ${order.orderNumber}] Emitting CANCELLATION notification.`);
        socketIO.to('admin_room').emit('order_cancelled', notificationData);
        // Fallback global event
        socketIO.emit('order_cancelled_global', notificationData);
      } else {
        // Optional: other status updates
        socketIO.to('admin_room').emit('order_status_updated', notificationData);
      }
    } catch (socketError) {
      console.error('Socket notification for status update failed:', socketError);
    }

    // Send status update email - Background process
    const statusMessages = {
      'confirmed': 'Your order has been confirmed and is being prepared.',
      'preparing': 'Your order is being prepared in our kitchen.',
      'ready': 'Your order is ready for pickup!',
      'served': 'Your order has been served. Enjoy your meal!',
      'cancelled': 'Your order has been cancelled.'
    };

    sendEmail(
      order.customer.email,
      `Order Status Update - ${order.orderNumber}`,
      `
      <h2>Order Status Updated</h2>
      <p>Dear ${order.customer.name},</p>
      <p>Good news! The status of your order <strong>#${order.orderNumber}</strong> has been updated.</p>
      <div class="highlight" style="text-align: center;">
        <p style="margin-bottom: 8px; color: #A0AEC0;">Current Status:</p>
        <h2 style="color: #D4AF37; margin: 0 0 16px; font-size: 24px;">${order.status.toUpperCase()}</h2>
        <p style="font-size: 16px; color: #E2E8F0;">${statusMessages[status] || 'Your order status has been updated.'}</p>
      </div>
      <div class="button-container">
        <a href="${process.env.FRONTEND_URL || '#'}/profile" class="button">Track Progress</a>
      </div>
      <p>Thank you for dining with Garden Grains!</p>
      <p>Best regards,<br>The Garden Grains Team</p>
      `
    ).catch(emailError => {
      console.error('Status update email failed in background:', emailError);
    });

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusDisplay: order.statusDisplay
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private (Admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/feedback
// @desc    Add feedback to order
// @access  Private
router.post('/:id/feedback', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.status !== 'served') {
      return res.status(400).json({ message: 'Feedback can only be submitted for served orders' });
    }

    order.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await order.save();

    res.json({
      message: 'Feedback submitted successfully',
      feedback: order.feedback
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/invoice/:id
// @desc    Get order invoice as PDF
// @access  Public
router.get('/invoice/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name price')
      .populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const pdfBuffer = await generateInvoicePDF(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Invoice-${order.orderNumber}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('[Invoice Critical Error]:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

module.exports = router;
