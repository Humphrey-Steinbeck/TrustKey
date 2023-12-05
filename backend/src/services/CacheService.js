// TrustKey Cache Service

const NodeCache = require('node-cache');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600, // Default TTL: 1 hour
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false, // Don't clone objects for better performance
    });

    this.setupEventListeners();
  }

  /**
   * Setup cache event listeners
   */
  setupEventListeners() {
    this.cache.on('set', (key, value) => {
      logger.debug('Cache set:', { key, valueSize: JSON.stringify(value).length });
    });

    this.cache.on('del', (key) => {
      logger.debug('Cache deleted:', { key });
    });

    this.cache.on('expired', (key, value) => {
      logger.debug('Cache expired:', { key });
    });
  }

  /**
   * Set cache value
   */
  set(key, value, ttl = null) {
    try {
      if (ttl) {
        this.cache.set(key, value, ttl);
      } else {
        this.cache.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Failed to set cache:', error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  get(key) {
    try {
      return this.cache.get(key);
    } catch (error) {
      logger.error('Failed to get cache:', error);
      return undefined;
    }
  }

  /**
   * Delete cache value
   */
  del(key) {
    try {
      return this.cache.del(key);
    } catch (error) {
      logger.error('Failed to delete cache:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Get multiple keys
   */
  mget(keys) {
    try {
      return this.cache.mget(keys);
    } catch (error) {
      logger.error('Failed to get multiple cache values:', error);
      return {};
    }
  }

  /**
   * Set multiple keys
   */
  mset(keyValuePairs, ttl = null) {
    try {
      if (ttl) {
        for (const [key, value] of Object.entries(keyValuePairs)) {
          this.cache.set(key, value, ttl);
        }
      } else {
        this.cache.mset(keyValuePairs);
      }
      return true;
    } catch (error) {
      logger.error('Failed to set multiple cache values:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Flush all cache
   */
  flush() {
    try {
      this.cache.flushAll();
      logger.info('Cache flushed successfully');
      return true;
    } catch (error) {
      logger.error('Failed to flush cache:', error);
      return false;
    }
  }

  /**
   * Get all keys
   */
  keys() {
    return this.cache.keys();
  }

  /**
   * Get TTL for key
   */
  getTtl(key) {
    return this.cache.getTtl(key);
  }

  /**
   * Set TTL for key
   */
  setTtl(key, ttl) {
    try {
      return this.cache.ttl(key, ttl);
    } catch (error) {
      logger.error('Failed to set TTL:', error);
      return false;
    }
  }

  /**
   * Cache user data
   */
  cacheUser(userId, userData, ttl = 1800) { // 30 minutes
    return this.set(`user:${userId}`, userData, ttl);
  }

  /**
   * Get cached user data
   */
  getCachedUser(userId) {
    return this.get(`user:${userId}`);
  }

  /**
   * Cache credential data
   */
  cacheCredential(credentialId, credentialData, ttl = 3600) { // 1 hour
    return this.set(`credential:${credentialId}`, credentialData, ttl);
  }

  /**
   * Get cached credential data
   */
  getCachedCredential(credentialId) {
    return this.get(`credential:${credentialId}`);
  }

  /**
   * Cache reputation data
   */
  cacheReputation(userId, reputationData, ttl = 900) { // 15 minutes
    return this.set(`reputation:${userId}`, reputationData, ttl);
  }

  /**
   * Get cached reputation data
   */
  getCachedReputation(userId) {
    return this.get(`reputation:${userId}`);
  }

  /**
   * Cache verification result
   */
  cacheVerificationResult(proofHash, result, ttl = 7200) { // 2 hours
    return this.set(`verification:${proofHash}`, result, ttl);
  }

  /**
   * Get cached verification result
   */
  getCachedVerificationResult(proofHash) {
    return this.get(`verification:${proofHash}`);
  }

  /**
   * Cache blockchain transaction
   */
  cacheTransaction(txHash, txData, ttl = 86400) { // 24 hours
    return this.set(`tx:${txHash}`, txData, ttl);
  }

  /**
   * Get cached transaction data
   */
  getCachedTransaction(txHash) {
    return this.get(`tx:${txHash}`);
  }

  /**
   * Cache API response
   */
  cacheApiResponse(endpoint, params, response, ttl = 300) { // 5 minutes
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.set(key, response, ttl);
  }

  /**
   * Get cached API response
   */
  getCachedApiResponse(endpoint, params) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.get(key);
  }

  /**
   * Cache rate limit data
   */
  cacheRateLimit(identifier, data, ttl = 900) { // 15 minutes
    return this.set(`rate_limit:${identifier}`, data, ttl);
  }

  /**
   * Get cached rate limit data
   */
  getCachedRateLimit(identifier) {
    return this.get(`rate_limit:${identifier}`);
  }

  /**
   * Clear user-related cache
   */
  clearUserCache(userId) {
    const keys = this.keys().filter(key => key.startsWith(`user:${userId}`));
    keys.forEach(key => this.del(key));
    logger.info('User cache cleared:', { userId, keysCleared: keys.length });
  }

  /**
   * Clear credential cache
   */
  clearCredentialCache(credentialId) {
    this.del(`credential:${credentialId}`);
    logger.info('Credential cache cleared:', { credentialId });
  }

  /**
   * Clear reputation cache
   */
  clearReputationCache(userId) {
    this.del(`reputation:${userId}`);
    logger.info('Reputation cache cleared:', { userId });
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUpCache() {
    try {
      logger.info('Starting cache warm-up...');
      
      // This would typically load frequently accessed data
      // For now, just log the warm-up process
      
      logger.info('Cache warm-up completed');
    } catch (error) {
      logger.error('Cache warm-up failed:', error);
    }
  }

  /**
   * Get cache health status
   */
  getHealthStatus() {
    const stats = this.getStats();
    return {
      status: 'healthy',
      stats,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }
}

module.exports = new CacheService();
