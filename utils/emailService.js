const nodemailer = require('nodemailer');

console.log('✅ emailService.js loaded with Ethereal fallback');

// Try Gmail first, fallback to Ethereal
const createTransporter = async () => {
  console.log('🔄 Creating transporter...');
  
  // Try Gmail with explicit host
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,  // Use 587 instead of 465
      secure: false,  // TLS, not SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      family: 4,
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 5000,
      socketTimeout: 5000
    });
    
    await transporter.verify();
    console.log('✅ Gmail transporter verified!');
    return transporter;
  } catch (error) {
    console.log('⚠️ Gmail failed, trying Ethereal...');
    
    // Create a test account on Ethereal (free, no restrictions)
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal account created:', testAccount.user);
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('✅ Ethereal transporter ready!');
    return transporter;
  }
};

// Send email to applicant when approved
exports.sendApprovalEmail = async (to, name, jobTitle, username, password) => {
  try {
    console.log(`📧 Sending approval email to ${to}...`);
    
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'no-reply@jobportal.com',
      to: to,
      subject: '🎉 Congratulations! Your Application Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="background: #2563eb; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0;">Job Portal</h1>
            <p style="margin: 5px 0 0;">Application Approved!</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Dear ${name},</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Congratulations! Your application for the position of 
              <strong>${jobTitle}</strong> has been approved!
            </p>
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #166534;">🔑 Your Login Credentials</h3>
              <p style="margin: 5px 0;"><strong>Username:</strong> <span style="font-family: monospace;">${username}</span></p>
              <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace;">${password}</span></p>
              <p style="margin: 10px 0 0; font-size: 14px; color: #15803d;">
                ⚠️ Please change your password after first login.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to Your Account
              </a>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
    // If using Ethereal, show preview URL
    if (transporter.options.host === 'smtp.ethereal.email') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;

  } catch (error) {
    console.error('❌ Email error:', error.message);
    return false;
  }
};

// Send rejection email
exports.sendRejectionEmail = async (to, name, jobTitle) => {
  try {
    console.log(`📧 Sending rejection email to ${to}...`);

    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'no-reply@jobportal.com',
      to: to,
      subject: 'Application Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
          <div style="background: #dc2626; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0;">Job Portal</h1>
            <p style="margin: 5px 0 0;">Application Update</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Dear ${name},</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for your interest in the position of <strong>${jobTitle}</strong>.
            </p>
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;">
                <strong>❌ Application Status:</strong> We regret to inform you that your application 
                has been <strong>rejected</strong>.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs" 
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Browse More Jobs
              </a>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent to:', to);
    return true;

  } catch (error) {
    console.error('❌ Rejection email failed:', error.message);
    return false;
  }
};