const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/sendEmail');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact form message
// @access  Public
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, subject, message } = req.body;

  try {
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    await newContact.save();

    // Send email to admin
    const emailHtml = `
      <div style="background-color: #1a1f26; color: #E2E8F0; padding: 30px; border-radius: 12px; border: 1px solid #2d3748;">
        <h2 style="color: #D4AF37; margin-bottom: 20px;">New Contact Message Received</h2>
        <div style="margin-bottom: 20px; padding: 20px; background-color: #0B0F14; border-radius: 8px;">
          <p style="margin: 0 0 10px 0;"><strong>Name:</strong> <span style="color: #FFFFFF;">${name}</span></p>
          <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <span style="color: #FFFFFF;">${email}</span></p>
          <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> <span style="color: #FFFFFF;">${subject}</span></p>
        </div>
        <div style="padding: 20px; background-color: #0B0F14; border-radius: 8px; border-left: 4px solid #D4AF37;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #D4AF37;">Message:</p>
          <p style="margin: 0; line-height: 1.6; color: #FFFFFF;">${message}</p>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #718096; text-align: center;">
          This message was sent from the Garden Grains Contact Form.
        </p>
      </div>
    `;

    // You can replace process.env.GMAIL_USER with a specific admin email if needed
    await sendEmail(process.env.GMAIL_USER, `New Contact Message: ${subject}`, emailHtml);

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private/Admin
// (Optional logic if you want to view messages in admin panel later)

module.exports = router;
