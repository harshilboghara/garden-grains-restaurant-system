const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create a reusable transporter instance with connection pooling
// Create a reusable transporter instance
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendEmail = async (to, subject, htmlContent, extraAttachments = []) => {
  try {

    const appName = "Garden Grains";
    const logoFileName = 'logo.png';
    const logoPath = path.resolve(__dirname, '../../frontend/src/assets/logo.png');
    
    let logoAttachment = null;
    try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoAttachment = {
          filename: logoFileName,
          content: logoBuffer,
          cid: 'companylogo'
        };
      }
    } catch (fsError) {
      console.warn('Could not read logo file (skipping attachment):', fsError.message);
    }

    const hasLogo = !!logoAttachment;

    // Email options
    const mailOptions = {
      from: `${appName} <${process.env.GMAIL_USER}>`,
      to,
      subject,
      attachments: [
        ...(hasLogo ? [logoAttachment] : []),
        ...extraAttachments
      ],
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <!--[if mso]>
          <style type="text/css">
            body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
          </style>
          <![endif]-->
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              width: 100% !important;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              background-color: #0B0F14;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #E2E8F0;
            }
            .wrapper {
              width: 100%;
              table-layout: fixed;
              background-color: #0B0F14;
              padding-bottom: 40px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #11151C;
              overflow: hidden;
              border: 1px solid #2A2F38;
              border-radius: 12px;
            }
            .header {
              padding: 40px 0 20px;
              text-align: center;
              background-color: #11151C;
              border-bottom: 1px solid #2A2F38;
            }
            .logo-wrapper {
              margin: 0 auto 16px;
              text-align: center;
            }
            .logo-placeholder {
              width: 64px;
              height: 64px;
              margin: 0 auto;
              background-color: #1F2937;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #D4AF37;
              font-size: 32px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              border: 1px solid #D4AF37;
            }
            .logo-img {
              width: 64px;
              height: 64px;
              border-radius: 16px;
              object-fit: cover;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              border: 1px solid #D4AF37;
            }
            .brand-name {
              font-size: 24px;
              font-weight: 700;
              color: #D4AF37;
              margin: 0;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
            .hero {
              padding: 0 40px 20px;
              text-align: center;
            }
            .hero h1 {
              font-size: 32px;
              font-weight: 700;
              color: #FFFFFF;
              margin: 0 0 16px;
              line-height: 1.2;
            }
            .content {
              padding: 30px 40px;
              line-height: 1.6;
              color: #CBD5E0;
              font-size: 16px;
            }
            .content h2 {
              color: #FFFFFF;
              font-size: 20px;
              font-weight: 600;
              margin-top: 0;
            }
            .content p {
              margin-bottom: 20px;
              color: #A0AEC0;
            }
            .button-container {
              padding: 20px 40px 40px;
              text-align: center;
            }
            .button {
              display: inline-block;
              background-color: #D4AF37;
              color: #0B0F14 !important;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              font-size: 16px;
              transition: background-color 0.2s;
              box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .highlight {
              background-color: #1A1F26;
              border: 1px solid #2A2F38;
              border-left: 4px solid #D4AF37;
              padding: 20px;
              margin: 24px 0;
              border-radius: 4px;
            }
            .divider {
              border-top: 1px solid #2A2F38;
              margin: 20px 40px;
            }
            .footer {
              padding: 40px;
              text-align: center;
              background-color: #0B0F14;
              color: #718096;
              font-size: 14px;
              border-top: 1px solid #2A2F38;
            }
            .social-links {
              margin-bottom: 20px;
            }
            .social-icon {
              display: inline-block;
              width: 32px;
              height: 32px;
              margin: 0 8px;
              background-color: #1A1F26;
              border-radius: 50%;
              line-height: 32px;
              color: #D4AF37;
              text-decoration: none;
              border: 1px solid #2A2F38;
            }
            .contact-info p {
              margin: 4px 0;
            }
            .copyright {
              margin-top: 24px;
              font-size: 12px;
              color: #4A5568;
            }
            strong {
              color: #FFFFFF;
            }
            @media only screen and (max-width: 600px) {
              .hero h1 { font-size: 26px !important; }
              .content { padding: 20px !important; }
              .hero { padding: 0 20px !important; }
              .button-container { padding: 20px !important; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="logo-wrapper">
                  ${hasLogo ? 
                    `<img src="cid:companylogo" alt="${appName}" class="logo-img">` : 
                    `<div class="logo-placeholder">🌱</div>`
                  }
                </div>
                <h2 class="brand-name">${appName}</h2>
              </div>
              
              <div class="hero">
                <!-- Title can be passed via subject or inside htmlContent -->
              </div>

              <div class="content">
                ${htmlContent}
              </div>

              <!-- Footer Section -->
              <div class="divider"></div>
              <div class="footer">
                <div class="social-links">
                  <a href="#" class="social-icon">f</a>
                  <a href="#" class="social-icon">i</a>
                  <a href="#" class="social-icon">t</a>
                </div>
                <div class="contact-info">
                  <p><strong>${appName} Restaurant Office</strong></p>
                  <p>123 Green Street, Garden City, GC 12345</p>
                  <p>Phone: +1 (555) 123-4567 | Email: info@gardengrains.com</p>
                </div>
                <div class="copyright">
                  <p>© ${new Date().getFullYear()} ${appName} Restaurant. All rights reserved.</p>
                  <p>If you have any questions, please contact our support team.</p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = { sendEmail };
