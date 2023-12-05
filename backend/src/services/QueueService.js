// TrustKey Queue Service

const Bull = require('bull');
const logger = require('../utils/logger');

class QueueService {
  constructor() {
    this.queues = new Map();
    this.initializeQueues();
  }

  /**
   * Initialize all queues
   */
  initializeQueues() {
    // Email queue
    this.createQueue('email', {
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Notification queue
    this.createQueue('notification', {
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 10,
        attempts: 2,
      },
    });

    // Blockchain queue
    this.createQueue('blockchain', {
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    });

    // File processing queue
    this.createQueue('file-processing', {
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 2,
      },
    });

    // Verification queue
    this.createQueue('verification', {
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 15,
        attempts: 3,
      },
    });

    // Cleanup queue
    this.createQueue('cleanup', {
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 5,
        attempts: 1,
      },
    });

    this.setupQueueProcessors();
    this.setupQueueEvents();
  }

  /**
   * Create a new queue
   */
  createQueue(name, options = {}) {
    try {
      const queue = new Bull(name, {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
        },
        ...options,
      });

      this.queues.set(name, queue);
      logger.info(`Queue created: ${name}`);
      return queue;
    } catch (error) {
      logger.error(`Failed to create queue ${name}:`, error);
      return null;
    }
  }

  /**
   * Get queue by name
   */
  getQueue(name) {
    return this.queues.get(name);
  }

  /**
   * Add job to queue
   */
  async addJob(queueName, jobName, data, options = {}) {
    try {
      const queue = this.getQueue(queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      const job = await queue.add(jobName, data, options);
      logger.info(`Job added to ${queueName}:`, {
        jobId: job.id,
        jobName,
        data: Object.keys(data),
      });

      return job;
    } catch (error) {
      logger.error(`Failed to add job to ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Setup queue processors
   */
  setupQueueProcessors() {
    // Email queue processor
    const emailQueue = this.getQueue('email');
    if (emailQueue) {
      emailQueue.process('send-welcome', require('./processors/emailProcessor').sendWelcome);
      emailQueue.process('send-verification', require('./processors/emailProcessor').sendVerification);
      emailQueue.process('send-notification', require('./processors/emailProcessor').sendNotification);
    }

    // Notification queue processor
    const notificationQueue = this.getQueue('notification');
    if (notificationQueue) {
      notificationQueue.process('push-notification', require('./processors/notificationProcessor').sendPush);
      notificationQueue.process('in-app-notification', require('./processors/notificationProcessor').sendInApp);
    }

    // Blockchain queue processor
    const blockchainQueue = this.getQueue('blockchain');
    if (blockchainQueue) {
      blockchainQueue.process('deploy-contract', require('./processors/blockchainProcessor').deployContract);
      blockchainQueue.process('send-transaction', require('./processors/blockchainProcessor').sendTransaction);
      blockchainQueue.process('verify-transaction', require('./processors/blockchainProcessor').verifyTransaction);
    }

    // File processing queue processor
    const fileQueue = this.getQueue('file-processing');
    if (fileQueue) {
      fileQueue.process('resize-image', require('./processors/fileProcessor').resizeImage);
      fileQueue.process('generate-thumbnail', require('./processors/fileProcessor').generateThumbnail);
      fileQueue.process('scan-virus', require('./processors/fileProcessor').scanVirus);
    }

    // Verification queue processor
    const verificationQueue = this.getQueue('verification');
    if (verificationQueue) {
      verificationQueue.process('generate-proof', require('./processors/verificationProcessor').generateProof);
      verificationQueue.process('verify-proof', require('./processors/verificationProcessor').verifyProof);
    }

    // Cleanup queue processor
    const cleanupQueue = this.getQueue('cleanup');
    if (cleanupQueue) {
      cleanupQueue.process('cleanup-temp-files', require('./processors/cleanupProcessor').cleanupTempFiles);
      cleanupQueue.process('cleanup-expired-cache', require('./processors/cleanupProcessor').cleanupExpiredCache);
      cleanupQueue.process('cleanup-old-jobs', require('./processors/cleanupProcessor').cleanupOldJobs);
    }
  }

  /**
   * Setup queue events
   */
  setupQueueEvents() {
    for (const [name, queue] of this.queues) {
      // Job events
      queue.on('completed', (job) => {
        logger.info(`Job completed in ${name}:`, { jobId: job.id, jobName: job.name });
      });

      queue.on('failed', (job, err) => {
        logger.error(`Job failed in ${name}:`, {
          jobId: job.id,
          jobName: job.name,
          error: err.message,
        });
      });

      queue.on('stalled', (job) => {
        logger.warn(`Job stalled in ${name}:`, { jobId: job.id, jobName: job.name });
      });

      // Queue events
      queue.on('waiting', (jobId) => {
        logger.debug(`Job waiting in ${name}:`, { jobId });
      });

      queue.on('active', (job) => {
        logger.debug(`Job active in ${name}:`, { jobId: job.id, jobName: job.name });
      });

      queue.on('progress', (job, progress) => {
        logger.debug(`Job progress in ${name}:`, {
          jobId: job.id,
          jobName: job.name,
          progress,
        });
      });
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName) {
    try {
      const queue = this.getQueue(queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      return {
        name: queueName,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };
    } catch (error) {
      logger.error(`Failed to get stats for queue ${queueName}:`, error);
      return null;
    }
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats() {
    const stats = [];
    for (const [name] of this.queues) {
      const queueStats = await this.getQueueStats(name);
      if (queueStats) {
        stats.push(queueStats);
      }
    }
    return stats;
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName) {
    try {
      const queue = this.getQueue(queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      await queue.pause();
      logger.info(`Queue paused: ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to pause queue ${queueName}:`, error);
      return false;
    }
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName) {
    try {
      const queue = this.getQueue(queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      await queue.resume();
      logger.info(`Queue resumed: ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to resume queue ${queueName}:`, error);
      return false;
    }
  }

  /**
   * Clean queue
   */
  async cleanQueue(queueName, grace = 5000) {
    try {
      const queue = this.getQueue(queueName);
      if (!queue) {
        throw new Error(`Queue ${queueName} not found`);
      }

      await queue.clean(grace, 'completed');
      await queue.clean(grace, 'failed');
      logger.info(`Queue cleaned: ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to clean queue ${queueName}:`, error);
      return false;
    }
  }

  /**
   * Close all queues
   */
  async closeAllQueues() {
    try {
      for (const [name, queue] of this.queues) {
        await queue.close();
        logger.info(`Queue closed: ${name}`);
      }
      logger.info('All queues closed successfully');
      return true;
    } catch (error) {
      logger.error('Failed to close queues:', error);
      return false;
    }
  }

  /**
   * Schedule recurring jobs
   */
  scheduleRecurringJobs() {
    // Cleanup job every hour
    this.addJob('cleanup', 'cleanup-temp-files', {}, {
      repeat: { cron: '0 * * * *' }, // Every hour
      jobId: 'cleanup-temp-files-hourly',
    });

    // Cache cleanup job every 30 minutes
    this.addJob('cleanup', 'cleanup-expired-cache', {}, {
      repeat: { cron: '*/30 * * * *' }, // Every 30 minutes
      jobId: 'cleanup-expired-cache-30min',
    });

    // Old jobs cleanup every day
    this.addJob('cleanup', 'cleanup-old-jobs', {}, {
      repeat: { cron: '0 2 * * *' }, // Every day at 2 AM
      jobId: 'cleanup-old-jobs-daily',
    });

    logger.info('Recurring jobs scheduled successfully');
  }
}

module.exports = new QueueService();
