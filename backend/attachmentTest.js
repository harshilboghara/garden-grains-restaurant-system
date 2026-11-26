require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('Starting enhance test...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const logoPath = path.resolve(__dirname, '../frontend/src/assets/logo.png');
  console.log('Logo Path:', logoPath);
  console.log('Exists:', fs.existsSync(logoPath));

  try {
    console.log('Sending multipart mail...');
    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: "Test Attachment",
      html: "<p>With Logo</p>",
      attachments: fs.existsSync(logoPath) ? [{
          filename: 'logo.png',
          path: logoPath,
          cid: 'companylogo'
      }] : []
    });
    console.log('Message sent: %s', info.messageId);
    process.exit(0);
  } catch (error) {
    console.error('Send failed:', error);
    process.exit(1);
  }
}

main();
