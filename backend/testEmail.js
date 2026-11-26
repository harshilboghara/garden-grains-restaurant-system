require('dotenv').config();
const { sendEmail } = require('./utils/sendEmail');

async function test() {
  console.log('Testing email configuration...');
  console.log('User:', process.env.GMAIL_USER);
  console.log('Pass:', process.env.GMAIL_PASS ? '********' : 'NOT SET');

  try {
    console.log('Calling sendEmail...');
    const result = await sendEmail(
      process.env.GMAIL_USER,
      'Test Email Debug',
      '<p>Test</p>'
    );
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Test FAILED.');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.response) console.error('SMTP Response:', error.response);
  }
}

test().then(() => {
    console.log('Test finished.');
    process.exit(0); // Force exit if pool keeps open
}).catch(err => {
    console.error('Unhandled script error:', err);
    process.exit(1);
});
