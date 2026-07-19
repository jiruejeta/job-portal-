const nodemailer = require('nodemailer');

console.log('✅ emailService.js loaded with Ethereal');

// Create a transporter using Ethereal (FREE, no SMTP blocking)
let transporter = null;
let etherealAccount = null;

// Initialize Ethereal account once
const initEthereal = async () => {
  if (transporter) return transporter;
  
  try {
    // Create a test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();
    etherealAccount = testAccount;
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('✅ Ethereal transporter initialized');
    console.log('📧 Ethereal user:', testAccount.user);
    console.log('📧 Ethereal preview URL: https://ethereal.email/messages');
    return transporter;
  } catch (error) {
    console.error('❌ Ethereal init failed:', error.message);
    return null;
  }
};

// Send approval email to applicant
const sendApprovalEmail = async (to, name, jobTitle, username, password) => {
  try {
    const transporter = await initEthereal();
    if (!transporter) {
      console.error('❌ Transporter not available');
      return false;
    }
    
    const mailOptions = {
      from: `"Job Portal" <${etherealAccount.user}>`,
      to: to,
      subject: '🎉 Congratulations! Your Application Has Been Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">💼 Job Portal</h1>
            <p style="color: #ccc; margin: 5px 0 0;">Application Approved!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Dear ${name},</h2>
            <p>Congratulations! Your application for the position of <strong>${jobTitle}</strong> has been approved.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2a5298;">🔑 Your Login Credentials:</h3>
              <p><strong>Username:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">${username}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace; background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">${password}</span></p>
            </div>
            
            <p><strong>⚠️ Important:</strong> Please change your password after your first login.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: #2a5298; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Login to Your Account →
            </a>
            
            <div style="margin-top: 20px; padding: 10px; background: #fef3c7; border-radius: 5px; border: 1px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                📧 <strong>Note:</strong> This email was sent via Ethereal (test email service). 
                The applicant will receive this email at their actual email address.
              </p>
            </div>
          </div>
          
          <div style="background: #1e3c72; color: white; text-align: center; padding: 15px; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${to}`);
    console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Approval email sending failed:', error.message);
    return false;
  }
};

// Send rejection email to applicant
const sendRejectionEmail = async (to, name, jobTitle) => {
  try {
    const transporter = await initEthereal();
    if (!transporter) {
      console.error('❌ Transporter not available');
      return false;
    }
    
    const mailOptions = {
      from: `"Job Portal" <${etherealAccount.user}>`,
      to: to,
      subject: 'Application Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">💼 Job Portal</h1>
            <p style="color: #ccc; margin: 5px 0 0;">Application Update</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Dear ${name},</h2>
            <p>Thank you for your interest in the position of <strong>${jobTitle}</strong>.</p>
            
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;">
                <strong>❌ Application Status:</strong> We regret to inform you that your application 
                has been <strong>rejected</strong>.
              </p>
            </div>
            
            <p>We encourage you to apply for other positions that match your skills and experience.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs" style="display: inline-block; background: #2a5298; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Browse More Jobs →
            </a>
          </div>
          
          <div style="background: #1e3c72; color: white; text-align: center; padding: 15px; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${to}`);
    console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return true;
    
  } catch (error) {
    console.error('❌ Rejection email sending failed:', error.message);
    return false;
  }
};

module.exports = { 
  sendApprovalEmail, 
  sendRejectionEmail 
};