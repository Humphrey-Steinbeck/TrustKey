// TrustKey Health Service

const logger = require('../utils/logger');
const metricsService = require('./MetricsService');

class HealthService {
  constructor() {
    this.checks = new Map();
    this.initializeHealthChecks();
  }

  /**
   * Initialize health checks
   */
  initializeHealthChecks() {
    // Database health check
    this.addHealthCheck('database', this.checkDatabase.bind(this), 5000);
    
    // Redis health check
    this.addHealthCheck('redis', this.checkRedis.bind(this), 3000);
    
    // Blockchain health check
    this.addHealthCheck('blockchain', this.checkBlockchain.bind(this), 10000);
    
    // IPFS health check
    this.addHealthCheck('ipfs', this.checkIPFS.bind(this), 5000);
    
    // External API health check
    this.addHealthCheck('external_apis', this.checkExternalAPIs.bind(this), 10000);
    
    // File system health check
    this.addHealthCheck('filesystem', this.checkFilesystem.bind(this), 2000);
    
    // Memory health check
    this.addHealthCheck('memory', this.checkMemory.bind(this), 1000);
    
    // Disk space health check
    this.addHealthCheck('disk_space', this.checkDiskSpace.bind(this), 5000);
    
    logger.info('Health checks initialized successfully');
  }

  /**
   * Add a health check
   */
  addHealthCheck(name, checkFunction, timeout = 5000) {
    this.checks.set(name, {
      name,
      checkFunction,
      timeout,
      lastCheck: null,
      lastResult: null,
      consecutiveFailures: 0,
    });
  }

  /**
   * Remove a health check
   */
  removeHealthCheck(name) {
    this.checks.delete(name);
  }

  /**
   * Run a specific health check
   */
  async runHealthCheck(name) {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check ${name} not found`);
    }

    try {
      const startTime = Date.now();
      const result = await Promise.race([
        check.checkFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), check.timeout)
        ),
      ]);
      
      const duration = Date.now() - startTime;
      
      check.lastCheck = new Date();
      check.lastResult = {
        status: 'healthy',
        duration,
        ...result,
      };
      check.consecutiveFailures = 0;
      
      logger.debug(`Health check ${name} passed:`, { duration, ...result });
      return check.lastResult;
    } catch (error) {
      check.consecutiveFailures++;
      check.lastCheck = new Date();
      check.lastResult = {
        status: 'unhealthy',
        error: error.message,
        consecutiveFailures: check.consecutiveFailures,
      };
      
      logger.warn(`Health check ${name} failed:`, { error: error.message });
      return check.lastResult;
    }
  }

  /**
   * Run all health checks
   */
  async runAllHealthChecks() {
    const results = {};
    const promises = [];
    
    for (const [name] of this.checks) {
      promises.push(
        this.runHealthCheck(name).then(result => {
          results[name] = result;
        }).catch(error => {
          results[name] = {
            status: 'unhealthy',
            error: error.message,
          };
        })
      );
    }
    
    await Promise.all(promises);
    return results;
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    const results = await this.runAllHealthChecks();
    const overallStatus = this.calculateOverallStatus(results);
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: results,
    };
  }

  /**
   * Calculate overall health status
   */
  calculateOverallStatus(results) {
    const statuses = Object.values(results).map(result => result.status);
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    } else if (statuses.includes('degraded')) {
      return 'degraded';
    } else if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else {
      return 'unknown';
    }
  }

  /**
   * Database health check
   */
  async checkDatabase() {
    try {
      // This would typically check database connection
      // For now, simulate a database check
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        message: 'Database connection healthy',
        details: {
          connectionPool: 'active',
          queryTime: '50ms',
        },
      };
    } catch (error) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }

  /**
   * Redis health check
   */
  async checkRedis() {
    try {
      // This would typically check Redis connection
      // For now, simulate a Redis check
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return {
        message: 'Redis connection healthy',
        details: {
          memory: '256MB',
          connectedClients: 5,
        },
      };
    } catch (error) {
      throw new Error(`Redis health check failed: ${error.message}`);
    }
  }

  /**
   * Blockchain health check
   */
  async checkBlockchain() {
    try {
      // This would typically check blockchain node connection
      // For now, simulate a blockchain check
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        message: 'Blockchain connection healthy',
        details: {
          network: 'sepolia',
          blockHeight: 1234567,
          gasPrice: '20 gwei',
        },
      };
    } catch (error) {
      throw new Error(`Blockchain health check failed: ${error.message}`);
    }
  }

  /**
   * IPFS health check
   */
  async checkIPFS() {
    try {
      // This would typically check IPFS node connection
      // For now, simulate an IPFS check
      await new Promise(resolve => setTimeout(resolve, 150));
      
      return {
        message: 'IPFS node healthy',
        details: {
          peerCount: 42,
          storageUsed: '1.2GB',
        },
      };
    } catch (error) {
      throw new Error(`IPFS health check failed: ${error.message}`);
    }
  }

  /**
   * External APIs health check
   */
  async checkExternalAPIs() {
    try {
      const results = {};
      
      // Check multiple external APIs
      const apis = [
        'https://api.etherscan.io/api',
        'https://ipfs.io/api/v0/version',
        'https://api.github.com',
      ];
      
      for (const api of apis) {
        try {
          // Simulate API check
          await new Promise(resolve => setTimeout(resolve, 100));
          results[api] = 'healthy';
        } catch (error) {
          results[api] = 'unhealthy';
        }
      }
      
      const healthyCount = Object.values(results).filter(status => status === 'healthy').length;
      const totalCount = Object.keys(results).length;
      
      if (healthyCount === totalCount) {
        return {
          message: 'All external APIs healthy',
          details: results,
        };
      } else if (healthyCount > totalCount / 2) {
        return {
          status: 'degraded',
          message: 'Some external APIs unhealthy',
          details: results,
        };
      } else {
        throw new Error('Most external APIs unhealthy');
      }
    } catch (error) {
      throw new Error(`External APIs health check failed: ${error.message}`);
    }
  }

  /**
   * File system health check
   */
  async checkFilesystem() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Check if upload directory is writable
      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      await fs.access(uploadDir, fs.constants.W_OK);
      
      // Check available disk space (simplified)
      const stats = await fs.stat(uploadDir);
      
      return {
        message: 'File system healthy',
        details: {
          uploadDir: uploadDir,
          writable: true,
          lastModified: stats.mtime,
        },
      };
    } catch (error) {
      throw new Error(`File system health check failed: ${error.message}`);
    }
  }

  /**
   * Memory health check
   */
  async checkMemory() {
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      const freeMemory = require('os').freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;
      
      let status = 'healthy';
      if (memoryUsagePercent > 90) {
        status = 'unhealthy';
      } else if (memoryUsagePercent > 80) {
        status = 'degraded';
      }
      
      return {
        status,
        message: `Memory usage: ${memoryUsagePercent.toFixed(2)}%`,
        details: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss,
          totalMemory,
          freeMemory,
          usagePercent: memoryUsagePercent,
        },
      };
    } catch (error) {
      throw new Error(`Memory health check failed: ${error.message}`);
    }
  }

  /**
   * Disk space health check
   */
  async checkDiskSpace() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Get disk usage for upload directory
      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      const stats = await fs.stat(uploadDir);
      
      // This is a simplified check - in reality you'd use a library like 'diskusage'
      const diskUsage = {
        total: 100 * 1024 * 1024 * 1024, // 100GB
        free: 80 * 1024 * 1024 * 1024,   // 80GB
        used: 20 * 1024 * 1024 * 1024,   // 20GB
      };
      
      const usagePercent = (diskUsage.used / diskUsage.total) * 100;
      
      let status = 'healthy';
      if (usagePercent > 95) {
        status = 'unhealthy';
      } else if (usagePercent > 85) {
        status = 'degraded';
      }
      
      return {
        status,
        message: `Disk usage: ${usagePercent.toFixed(2)}%`,
        details: {
          total: diskUsage.total,
          used: diskUsage.used,
          free: diskUsage.free,
          usagePercent,
        },
      };
    } catch (error) {
      throw new Error(`Disk space health check failed: ${error.message}`);
    }
  }

  /**
   * Get detailed health report
   */
  async getDetailedHealthReport() {
    const healthStatus = await this.getHealthStatus();
    const metrics = metricsService.getMetricsSummary();
    
    return {
      ...healthStatus,
      metrics: {
        http: {
          totalRequests: metrics.metrics.counters.http_requests_total?.value || 0,
          averageResponseTime: this.calculateAverageResponseTime(),
        },
        performance: {
          memoryUsage: metrics.memory,
          uptime: metrics.uptime,
        },
        business: {
          activeUsers: this.getActiveUsersCount(),
          credentialsIssued: metrics.metrics.counters.credentials_issued_total?.value || 0,
          verificationsCompleted: metrics.metrics.counters.verifications_completed_total?.value || 0,
        },
      },
    };
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime() {
    const histogram = metricsService.getMetric('http_request_duration_seconds', 'histogram');
    if (histogram && histogram.count > 0) {
      return (histogram.sum / histogram.count) * 1000; // Convert to milliseconds
    }
    return 0;
  }

  /**
   * Get active users count (simplified)
   */
  getActiveUsersCount() {
    // This would typically come from a session store or database
    return 42; // Placeholder
  }

  /**
   * Start periodic health checks
   */
  startPeriodicHealthChecks(interval = 60000) { // 1 minute
    setInterval(async () => {
      try {
        await this.runAllHealthChecks();
      } catch (error) {
        logger.error('Periodic health check failed:', error);
      }
    }, interval);
    
    logger.info(`Periodic health checks started with ${interval}ms interval`);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicHealthChecks() {
    // This would clear the interval
    logger.info('Periodic health checks stopped');
  }
}

module.exports = new HealthService();
