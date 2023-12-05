// TrustKey Audit Service

const EventEmitter = require('events');
const logger = require('../utils/logger');

class AuditService extends EventEmitter {
  constructor() {
    super();
    this.auditLogs = [];
    this.maxLogs = 10000; // Maximum number of logs to keep in memory
    this.initializeAuditEvents();
  }

  /**
   * Initialize audit event listeners
   */
  initializeAuditEvents() {
    // Listen for authentication events
    this.on('auth.login', this.logAuthEvent.bind(this));
    this.on('auth.logout', this.logAuthEvent.bind(this));
    this.on('auth.register', this.logAuthEvent.bind(this));
    this.on('auth.token_refresh', this.logAuthEvent.bind(this));
    
    // Listen for identity events
    this.on('identity.register', this.logIdentityEvent.bind(this));
    this.on('identity.update', this.logIdentityEvent.bind(this));
    this.on('identity.deactivate', this.logIdentityEvent.bind(this));
    
    // Listen for credential events
    this.on('credential.issue', this.logCredentialEvent.bind(this));
    this.on('credential.verify', this.logCredentialEvent.bind(this));
    this.on('credential.revoke', this.logCredentialEvent.bind(this));
    
    // Listen for reputation events
    this.on('reputation.update', this.logReputationEvent.bind(this));
    this.on('reputation.event', this.logReputationEvent.bind(this));
    
    // Listen for verification events
    this.on('verification.request', this.logVerificationEvent.bind(this));
    this.on('verification.complete', this.logVerificationEvent.bind(this));
    
    // Listen for admin events
    this.on('admin.action', this.logAdminEvent.bind(this));
    this.on('admin.user_management', this.logAdminEvent.bind(this));
    
    // Listen for security events
    this.on('security.violation', this.logSecurityEvent.bind(this));
    this.on('security.suspicious_activity', this.logSecurityEvent.bind(this));
  }

  /**
   * Log authentication event
   */
  logAuthEvent(event, data) {
    this.createAuditLog({
      category: 'authentication',
      action: event,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      success: data.success,
      details: {
        method: data.method,
        timestamp: data.timestamp,
        error: data.error,
      },
    });
  }

  /**
   * Log identity event
   */
  logIdentityEvent(event, data) {
    this.createAuditLog({
      category: 'identity',
      action: event,
      userId: data.userId,
      ipAddress: data.ipAddress,
      details: {
        did: data.did,
        changes: data.changes,
        timestamp: data.timestamp,
      },
    });
  }

  /**
   * Log credential event
   */
  logCredentialEvent(event, data) {
    this.createAuditLog({
      category: 'credential',
      action: event,
      userId: data.userId,
      ipAddress: data.ipAddress,
      details: {
        credentialId: data.credentialId,
        credentialType: data.credentialType,
        issuer: data.issuer,
        subject: data.subject,
        timestamp: data.timestamp,
      },
    });
  }

  /**
   * Log reputation event
   */
  logReputationEvent(event, data) {
    this.createAuditLog({
      category: 'reputation',
      action: event,
      userId: data.userId,
      ipAddress: data.ipAddress,
      details: {
        eventType: data.eventType,
        scoreChange: data.scoreChange,
        newScore: data.newScore,
        timestamp: data.timestamp,
      },
    });
  }

  /**
   * Log verification event
   */
  logVerificationEvent(event, data) {
    this.createAuditLog({
      category: 'verification',
      action: event,
      userId: data.userId,
      ipAddress: data.ipAddress,
      details: {
        verificationId: data.verificationId,
        circuitType: data.circuitType,
        success: data.success,
        timestamp: data.timestamp,
      },
    });
  }

  /**
   * Log admin event
   */
  logAdminEvent(event, data) {
    this.createAuditLog({
      category: 'admin',
      action: event,
      userId: data.adminUserId,
      ipAddress: data.ipAddress,
      details: {
        targetUserId: data.targetUserId,
        action: data.action,
        changes: data.changes,
        timestamp: data.timestamp,
      },
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(event, data) {
    this.createAuditLog({
      category: 'security',
      action: event,
      userId: data.userId,
      ipAddress: data.ipAddress,
      severity: data.severity || 'medium',
      details: {
        violationType: data.violationType,
        description: data.description,
        blocked: data.blocked,
        timestamp: data.timestamp,
      },
    });
  }

  /**
   * Create audit log entry
   */
  createAuditLog(logData) {
    const auditLog = {
      id: this.generateAuditLogId(),
      timestamp: new Date().toISOString(),
      category: logData.category,
      action: logData.action,
      userId: logData.userId,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      severity: logData.severity || 'info',
      success: logData.success !== undefined ? logData.success : true,
      details: logData.details || {},
      metadata: {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        service: 'trustkey-api',
      },
    };

    // Add to in-memory logs
    this.auditLogs.unshift(auditLog);
    
    // Keep only the most recent logs
    if (this.auditLogs.length > this.maxLogs) {
      this.auditLogs = this.auditLogs.slice(0, this.maxLogs);
    }

    // Log to console/file
    logger.info('Audit log created:', {
      id: auditLog.id,
      category: auditLog.category,
      action: auditLog.action,
      userId: auditLog.userId,
    });

    // Emit audit event for external systems
    this.emit('audit.created', auditLog);

    return auditLog;
  }

  /**
   * Generate unique audit log ID
   */
  generateAuditLogId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `audit_${timestamp}_${random}`;
  }

  /**
   * Get audit logs with filters
   */
  getAuditLogs(filters = {}) {
    let filteredLogs = [...this.auditLogs];

    // Apply filters
    if (filters.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category);
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.ipAddress) {
      filteredLogs = filteredLogs.filter(log => log.ipAddress === filters.ipAddress);
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    if (filters.success !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.success === filters.success);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 100;
    const offset = (page - 1) * limit;

    return {
      logs: filteredLogs.slice(offset, offset + limit),
      total: filteredLogs.length,
      page,
      limit,
      totalPages: Math.ceil(filteredLogs.length / limit),
    };
  }

  /**
   * Get audit log by ID
   */
  getAuditLogById(id) {
    return this.auditLogs.find(log => log.id === id);
  }

  /**
   * Get audit statistics
   */
  getAuditStatistics(timeframe = '24h') {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const filteredLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp) >= startDate
    );

    const stats = {
      timeframe,
      totalEvents: filteredLogs.length,
      byCategory: {},
      byAction: {},
      bySeverity: {},
      bySuccess: { success: 0, failed: 0 },
      hourlyDistribution: {},
      topUsers: {},
      topIPs: {},
    };

    // Calculate statistics
    filteredLogs.forEach(log => {
      // By category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      // By action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      
      // By severity
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      // By success
      if (log.success) {
        stats.bySuccess.success++;
      } else {
        stats.bySuccess.failed++;
      }
      
      // Hourly distribution
      const hour = new Date(log.timestamp).getHours();
      stats.hourlyDistribution[hour] = (stats.hourlyDistribution[hour] || 0) + 1;
      
      // Top users
      if (log.userId) {
        stats.topUsers[log.userId] = (stats.topUsers[log.userId] || 0) + 1;
      }
      
      // Top IPs
      if (log.ipAddress) {
        stats.topIPs[log.ipAddress] = (stats.topIPs[log.ipAddress] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Export audit logs
   */
  exportAuditLogs(filters = {}, format = 'json') {
    const result = this.getAuditLogs(filters);
    
    switch (format) {
      case 'json':
        return JSON.stringify(result.logs, null, 2);
      
      case 'csv':
        if (result.logs.length === 0) return '';
        
        const headers = Object.keys(result.logs[0]).join(',');
        const rows = result.logs.map(log => 
          Object.values(log).map(value => 
            typeof value === 'object' ? JSON.stringify(value) : value
          ).join(',')
        );
        
        return [headers, ...rows].join('\n');
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Search audit logs
   */
  searchAuditLogs(query, filters = {}) {
    const allLogs = this.getAuditLogs(filters).logs;
    const searchTerm = query.toLowerCase();
    
    return allLogs.filter(log => 
      JSON.stringify(log).toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Clear old audit logs
   */
  clearOldAuditLogs(olderThanDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const initialCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
    
    const removedCount = initialCount - this.auditLogs.length;
    logger.info(`Cleared ${removedCount} old audit logs`);
    
    return removedCount;
  }

  /**
   * Get audit log summary
   */
  getAuditSummary() {
    return {
      totalLogs: this.auditLogs.length,
      maxLogs: this.maxLogs,
      oldestLog: this.auditLogs.length > 0 ? this.auditLogs[this.auditLogs.length - 1].timestamp : null,
      newestLog: this.auditLogs.length > 0 ? this.auditLogs[0].timestamp : null,
      categories: [...new Set(this.auditLogs.map(log => log.category))],
      actions: [...new Set(this.auditLogs.map(log => log.action))],
    };
  }
}

module.exports = new AuditService();
