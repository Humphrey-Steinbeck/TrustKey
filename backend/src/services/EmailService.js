// TrustKey Email Service

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to, username) {
    const mailOptions = {
      from: `"TrustKey" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'Welcome to TrustKey - Your Decentralized Identity Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Welcome to TrustKey!</h1>
          <p>Hello ${username},</p>
          <p>Welcome to TrustKey, your gateway to decentralized identity and reputation management.</p>
          <p>With TrustKey, you can:</p>
          <ul>
            <li>Create and manage your decentralized identity</li>
            <li>Generate and verify credentials</li>
            <li>Build and track your reputation score</li>
            <li>Use zero-knowledge proofs for privacy-preserving verification</li>
          </ul>
          <p>Get started by connecting your wallet and creating your first credential!</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      `,
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to, username, verificationCode) {
    const mailOptions = {
      from: `"TrustKey" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'Verify Your TrustKey Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Verify Your Account</h1>
          <p>Hello ${username},</p>
          <p>Please verify your email address by entering the following code:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 6px;">
            <h2 style="color: #3B82F6; margin: 0; font-size: 32px; letter-spacing: 4px;">${verificationCode}</h2>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this verification, please ignore this email.
          </p>
        </div>
      `,
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, username, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"TrustKey" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'Reset Your TrustKey Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Password Reset Request</h1>
          <p>Hello ${username},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
      `,
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send credential notification email
   */
  async sendCredentialNotificationEmail(to, username, credentialType) {
    const mailOptions = {
      from: `"TrustKey" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'New Credential Available',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">New Credential Available</h1>
          <p>Hello ${username},</p>
          <p>You have received a new ${credentialType} credential!</p>
          <p>Log in to your dashboard to view and manage your new credential.</p>
          <a href="${process.env.FRONTEND_URL}/credentials" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Credentials</a>
        </div>
      `,
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send reputation update email
   */
  async sendReputationUpdateEmail(to, username, newScore, change) {
    const mailOptions = {
      from: `"TrustKey" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'Your TrustKey Reputation Score Updated',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Reputation Score Update</h1>
          <p>Hello ${username},</p>
          <p>Your reputation score has been updated!</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 6px;">
            <h2 style="color: #3B82F6; margin: 0;">New Score: ${newScore}</h2>
            <p style="margin: 5px 0 0 0; color: ${change > 0 ? '#10B981' : '#EF4444'};">
              ${change > 0 ? '+' : ''}${change} points
            </p>
          </div>
          <a href="${process.env.FRONTEND_URL}/reputation" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Reputation</a>
        </div>
      `,
    };

    return this.sendEmail(mailOptions);
  }

  /**
   * Send generic email
   */
  async sendEmail(mailOptions) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConfiguration() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.verify();
      logger.info('Email configuration verified successfully');
      return true;
    } catch (error) {
      logger.error('Email configuration verification failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
