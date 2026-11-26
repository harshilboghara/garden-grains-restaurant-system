require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Starting enhance test 2...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const logoPath = path.resolve(__dirname, '../frontend/src/assets/logo.png');
  console.log('Logo Path:', logoPath);

  if (!fs.existsSync(logoPath)) {
      console.log('File NOT found');
      return;
  }
  
  // Try reading file content first
  console.log('Reading file...');
  let logoContent;
  try {
      logoContent = fs.readFileSync(logoPath);
      console.log('Read file success. Size:', logoContent.length);
  } catch (e) {
      console.error('Read fail:', e);
      return;
  }

  try {
    console.log('Sending multipart mail with content...');
    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: "Test Content Attachment",
      html: "<p>With Logo Content</p>",
      attachments: [{
          filename: 'logo.png',
          content: logoContent,
          cid: 'companylogo'
      }]
    });
    console.log('Message sent: %s', info.messageId);
    process.exit(0);
  } catch (error) {
    console.error('Send failed:', error);
    process.exit(1);
  }
}

main();
