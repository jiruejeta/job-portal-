const nodemailer = require('nodemailer');

// Create transporter using your email credentials
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS  // your app password
    }
  });
};

// Send email to applicant when approved
exports.sendApprovalEmail = async (to, name, jobTitle, username, password) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
              <strong>${jobTitle}</strong> has been <strong style="color: #16a34a;">approved</strong>.
            </p>
            
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #166534;">🔑 Your Login Credentials</h3>
              <p style="margin: 5px 0;"><strong>Username:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">${username}</span></p>
              <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">${password}</span></p>
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
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If you have any questions, please contact us at 
              <a href="mailto:${process.env.EMAIL_USER}" style="color: #2563eb;">${process.env.EMAIL_USER}</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0;">
              © ${new Date().getFullYear()} Job Portal. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', to);
    console.log('📧 Message ID:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Send rejection email to applicant
exports.sendRejectionEmail = async (to, name, jobTitle) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
              Thank you for your interest in the position of 
              <strong>${jobTitle}</strong>.
            </p>
            
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;">
                <strong>❌ Application Status:</strong> We regret to inform you that your application 
                has been <strong>rejected</strong>.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              We encourage you to apply for other positions that match your skills and experience.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs" 
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Browse More Jobs
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If you have any questions, please contact us at 
              <a href="mailto:${process.env.EMAIL_USER}" style="color: #2563eb;">${process.env.EMAIL_USER}</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0;">
              © ${new Date().getFullYear()} Job Portal. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent to:', to);
    return true;

  } catch (error) {
    console.error('❌ Rejection email failed:', error);
    return false;
  }
};