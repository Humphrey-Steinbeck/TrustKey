// TrustKey Notification Service

const EventEmitter = require('events');
const logger = require('../utils/logger');
const emailService = require('./EmailService');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.notifications = new Map();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for automatic notifications
   */
  setupEventListeners() {
    // Listen for credential events
    this.on('credential.issued', this.handleCredentialIssued.bind(this));
    this.on('credential.verified', this.handleCredentialVerified.bind(this));
    this.on('credential.revoked', this.handleCredentialRevoked.bind(this));
    
    // Listen for reputation events
    this.on('reputation.updated', this.handleReputationUpdated.bind(this));
    this.on('reputation.level_changed', this.handleReputationLevelChanged.bind(this));
    
    // Listen for identity events
    this.on('identity.registered', this.handleIdentityRegistered.bind(this));
    this.on('identity.updated', this.handleIdentityUpdated.bind(this));
    
    // Listen for verification events
    this.on('verification.completed', this.handleVerificationCompleted.bind(this));
    this.on('verification.failed', this.handleVerificationFailed.bind(this));
  }

  /**
   * Send notification to user
   */
  async sendNotification(userId, type, data, channels = ['email', 'in_app']) {
    try {
      const notification = {
        id: this.generateNotificationId(),
        userId,
        type,
        data,
        channels,
        timestamp: new Date(),
        read: false,
      };

      // Store notification
      this.notifications.set(notification.id, notification);

      // Send through specified channels
      for (const channel of channels) {
        await this.sendThroughChannel(notification, channel);
      }

      logger.info('Notification sent successfully:', {
        notificationId: notification.id,
        userId,
        type,
        channels,
      });

      return notification;
    } catch (error) {
      logger.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send notification through specific channel
   */
  async sendThroughChannel(notification, channel) {
    switch (channel) {
      case 'email':
        await this.sendEmailNotification(notification);
        break;
      case 'in_app':
        await this.sendInAppNotification(notification);
        break;
      case 'push':
        await this.sendPushNotification(notification);
        break;
      case 'sms':
        await this.sendSmsNotification(notification);
        break;
      default:
        logger.warn(`Unknown notification channel: ${channel}`);
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification) {
    const { type, data, userId } = notification;
    
    // Get user email (this would typically come from user service)
    const userEmail = data.email || 'user@example.com';
    const username = data.username || 'User';

    switch (type) {
      case 'credential.issued':
        await emailService.sendCredentialNotificationEmail(
          userEmail, 
          username, 
          data.credentialType
        );
        break;
      case 'reputation.updated':
        await emailService.sendReputationUpdateEmail(
          userEmail, 
          username, 
          data.newScore, 
          data.change
        );
        break;
      case 'identity.registered':
        await emailService.sendWelcomeEmail(userEmail, username);
        break;
      default:
        logger.warn(`No email template for notification type: ${type}`);
    }
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(notification) {
    // This would typically save to database for in-app notification display
    logger.info('In-app notification created:', {
      notificationId: notification.id,
      userId: notification.userId,
      type: notification.type,
    });
  }

  /**
   * Send push notification
   */
  async sendPushNotification(notification) {
    // This would integrate with push notification service (FCM, APNS, etc.)
    logger.info('Push notification sent:', {
      notificationId: notification.id,
      userId: notification.userId,
      type: notification.type,
    });
  }

  /**
   * Send SMS notification
   */
  async sendSmsNotification(notification) {
    // This would integrate with SMS service (Twilio, etc.)
    logger.info('SMS notification sent:', {
      notificationId: notification.id,
      userId: notification.userId,
      type: notification.type,
    });
  }

  /**
   * Get notifications for user
   */
  getUserNotifications(userId, limit = 50, offset = 0) {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);

    return userNotifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      logger.info('Notification marked as read:', { notificationId });
    }
  }

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead(userId) {
    let count = 0;
    for (const notification of this.notifications.values()) {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        count++;
      }
    }
    logger.info('All notifications marked as read:', { userId, count });
    return count;
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId) {
    if (this.notifications.delete(notificationId)) {
      logger.info('Notification deleted:', { notificationId });
      return true;
    }
    return false;
  }

  /**
   * Get unread count for user
   */
  getUnreadCount(userId) {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .length;
  }

  /**
   * Event handlers
   */
  async handleCredentialIssued(data) {
    await this.sendNotification(
      data.userId,
      'credential.issued',
      {
        ...data,
        email: data.userEmail,
        username: data.username,
      },
      ['email', 'in_app']
    );
  }

  async handleCredentialVerified(data) {
    await this.sendNotification(
      data.userId,
      'credential.verified',
      data,
      ['in_app']
    );
  }

  async handleCredentialRevoked(data) {
    await this.sendNotification(
      data.userId,
      'credential.revoked',
      data,
      ['email', 'in_app']
    );
  }

  async handleReputationUpdated(data) {
    await this.sendNotification(
      data.userId,
      'reputation.updated',
      {
        ...data,
        email: data.userEmail,
        username: data.username,
      },
      ['email', 'in_app']
    );
  }

  async handleReputationLevelChanged(data) {
    await this.sendNotification(
      data.userId,
      'reputation.level_changed',
      data,
      ['email', 'in_app', 'push']
    );
  }

  async handleIdentityRegistered(data) {
    await this.sendNotification(
      data.userId,
      'identity.registered',
      {
        ...data,
        email: data.userEmail,
        username: data.username,
      },
      ['email', 'in_app']
    );
  }

  async handleIdentityUpdated(data) {
    await this.sendNotification(
      data.userId,
      'identity.updated',
      data,
      ['in_app']
    );
  }

  async handleVerificationCompleted(data) {
    await this.sendNotification(
      data.userId,
      'verification.completed',
      data,
      ['in_app']
    );
  }

  async handleVerificationFailed(data) {
    await this.sendNotification(
      data.userId,
      'verification.failed',
      data,
      ['email', 'in_app']
    );
  }

  /**
   * Generate unique notification ID
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get notification statistics
   */
  getStats() {
    const total = this.notifications.size;
    const unread = Array.from(this.notifications.values())
      .filter(n => !n.read).length;
    
    const byType = {};
    for (const notification of this.notifications.values()) {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
    }

    return {
      total,
      unread,
      byType,
    };
  }
}

module.exports = new NotificationService();
