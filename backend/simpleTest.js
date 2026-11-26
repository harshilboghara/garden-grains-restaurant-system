require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  console.log('Starting simple email test...');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  console.log('Transporter created. Verifying connection...');

  try {
    await transporter.verify();
    console.log('Server is ready to take our messages');
  } catch (error) {
    console.error('Verify failed:', error);
    return;
  }

  try {
    console.log('Sending mail...');
    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: "Test Email",
      text: "This is a test email from simpleTest.js",
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Send failed:', error);
  }
}

main().catch(console.error);
