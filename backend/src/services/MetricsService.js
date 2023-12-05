// TrustKey Metrics Service

const EventEmitter = require('events');
const logger = require('../utils/logger');

class MetricsService extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.timers = new Map();
    
    this.startTime = Date.now();
    this.initializeDefaultMetrics();
  }

  /**
   * Initialize default metrics
   */
  initializeDefaultMetrics() {
    // Application metrics
    this.createGauge('app_uptime_seconds', 'Application uptime in seconds');
    this.createGauge('app_memory_usage_bytes', 'Application memory usage in bytes');
    this.createGauge('app_cpu_usage_percent', 'Application CPU usage percentage');
    
    // HTTP metrics
    this.createCounter('http_requests_total', 'Total HTTP requests');
    this.createCounter('http_requests_by_method_total', 'HTTP requests by method');
    this.createCounter('http_requests_by_status_total', 'HTTP requests by status code');
    this.createHistogram('http_request_duration_seconds', 'HTTP request duration');
    
    // Authentication metrics
    this.createCounter('auth_login_attempts_total', 'Total login attempts');
    this.createCounter('auth_login_success_total', 'Total successful logins');
    this.createCounter('auth_login_failures_total', 'Total failed logins');
    this.createCounter('auth_token_refresh_total', 'Total token refreshes');
    
    // Blockchain metrics
    this.createCounter('blockchain_transactions_total', 'Total blockchain transactions');
    this.createCounter('blockchain_transactions_success_total', 'Successful blockchain transactions');
    this.createCounter('blockchain_transactions_failed_total', 'Failed blockchain transactions');
    this.createHistogram('blockchain_transaction_duration_seconds', 'Blockchain transaction duration');
    
    // Credential metrics
    this.createCounter('credentials_issued_total', 'Total credentials issued');
    this.createCounter('credentials_verified_total', 'Total credentials verified');
    this.createCounter('credentials_revoked_total', 'Total credentials revoked');
    this.createGauge('credentials_active_total', 'Total active credentials');
    
    // Reputation metrics
    this.createCounter('reputation_events_total', 'Total reputation events');
    this.createCounter('reputation_events_by_type_total', 'Reputation events by type');
    this.createGauge('reputation_average_score', 'Average reputation score');
    
    // Verification metrics
    this.createCounter('verifications_requested_total', 'Total verification requests');
    this.createCounter('verifications_completed_total', 'Total completed verifications');
    this.createCounter('verifications_failed_total', 'Total failed verifications');
    this.createHistogram('verification_duration_seconds', 'Verification duration');
    
    // Cache metrics
    this.createCounter('cache_hits_total', 'Total cache hits');
    this.createCounter('cache_misses_total', 'Total cache misses');
    this.createGauge('cache_size_bytes', 'Cache size in bytes');
    
    // Queue metrics
    this.createGauge('queue_jobs_waiting_total', 'Total jobs waiting in queues');
    this.createGauge('queue_jobs_active_total', 'Total active jobs in queues');
    this.createCounter('queue_jobs_completed_total', 'Total completed jobs');
    this.createCounter('queue_jobs_failed_total', 'Total failed jobs');
    
    // Database metrics
    this.createCounter('database_queries_total', 'Total database queries');
    this.createCounter('database_queries_by_type_total', 'Database queries by type');
    this.createHistogram('database_query_duration_seconds', 'Database query duration');
    this.createGauge('database_connections_active', 'Active database connections');
    
    // Error metrics
    this.createCounter('errors_total', 'Total errors');
    this.createCounter('errors_by_type_total', 'Errors by type');
    
    logger.info('Default metrics initialized successfully');
  }

  /**
   * Create a counter metric
   */
  createCounter(name, help, labels = []) {
    this.counters.set(name, {
      name,
      help,
      labels,
      value: 0,
      type: 'counter',
    });
  }

  /**
   * Create a gauge metric
   */
  createGauge(name, help, labels = []) {
    this.gauges.set(name, {
      name,
      help,
      labels,
      value: 0,
      type: 'gauge',
    });
  }

  /**
   * Create a histogram metric
   */
  createHistogram(name, help, buckets = [0.1, 0.5, 1, 2, 5, 10]) {
    this.histograms.set(name, {
      name,
      help,
      buckets,
      observations: [],
      count: 0,
      sum: 0,
      type: 'histogram',
    });
  }

  /**
   * Create a timer metric
   */
  createTimer(name, help) {
    this.timers.set(name, {
      name,
      help,
      startTime: null,
      durations: [],
      type: 'timer',
    });
  }

  /**
   * Increment a counter
   */
  incrementCounter(name, labels = {}, value = 1) {
    const counter = this.counters.get(name);
    if (counter) {
      counter.value += value;
      this.emit('metric_updated', { name, type: 'counter', value: counter.value, labels });
    } else {
      logger.warn(`Counter ${name} not found`);
    }
  }

  /**
   * Set a gauge value
   */
  setGauge(name, value, labels = {}) {
    const gauge = this.gauges.get(name);
    if (gauge) {
      gauge.value = value;
      this.emit('metric_updated', { name, type: 'gauge', value, labels });
    } else {
      logger.warn(`Gauge ${name} not found`);
    }
  }

  /**
   * Add an observation to histogram
   */
  observeHistogram(name, value) {
    const histogram = this.histograms.get(name);
    if (histogram) {
      histogram.observations.push(value);
      histogram.count++;
      histogram.sum += value;
      this.emit('metric_updated', { name, type: 'histogram', value, count: histogram.count });
    } else {
      logger.warn(`Histogram ${name} not found`);
    }
  }

  /**
   * Start a timer
   */
  startTimer(name) {
    const timer = this.timers.get(name);
    if (timer) {
      timer.startTime = Date.now();
    } else {
      logger.warn(`Timer ${name} not found`);
    }
  }

  /**
   * End a timer
   */
  endTimer(name) {
    const timer = this.timers.get(name);
    if (timer && timer.startTime) {
      const duration = Date.now() - timer.startTime;
      timer.durations.push(duration);
      timer.startTime = null;
      this.emit('metric_updated', { name, type: 'timer', value: duration });
      return duration;
    } else {
      logger.warn(`Timer ${name} not found or not started`);
      return null;
    }
  }

  /**
   * Get metric value
   */
  getMetric(name, type) {
    switch (type) {
      case 'counter':
        return this.counters.get(name);
      case 'gauge':
        return this.gauges.get(name);
      case 'histogram':
        return this.histograms.get(name);
      case 'timer':
        return this.timers.get(name);
      default:
        return null;
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(this.histograms),
      timers: Object.fromEntries(this.timers),
    };
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    // Update uptime
    const uptime = (Date.now() - this.startTime) / 1000;
    this.setGauge('app_uptime_seconds', uptime);

    // Update memory usage
    const memUsage = process.memoryUsage();
    this.setGauge('app_memory_usage_bytes', memUsage.heapUsed);

    // Update CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    this.setGauge('app_cpu_usage_percent', cpuUsage.user / 1000000);
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method, statusCode, duration) {
    this.incrementCounter('http_requests_total');
    this.incrementCounter('http_requests_by_method_total', { method });
    this.incrementCounter('http_requests_by_status_total', { status: statusCode.toString() });
    this.observeHistogram('http_request_duration_seconds', duration / 1000);
  }

  /**
   * Record authentication event
   */
  recordAuthEvent(event, success = true) {
    this.incrementCounter(`auth_${event}_total`);
    if (success) {
      this.incrementCounter(`auth_${event}_success_total`);
    } else {
      this.incrementCounter(`auth_${event}_failures_total`);
    }
  }

  /**
   * Record blockchain transaction
   */
  recordBlockchainTransaction(success, duration) {
    this.incrementCounter('blockchain_transactions_total');
    if (success) {
      this.incrementCounter('blockchain_transactions_success_total');
    } else {
      this.incrementCounter('blockchain_transactions_failed_total');
    }
    this.observeHistogram('blockchain_transaction_duration_seconds', duration / 1000);
  }

  /**
   * Record credential event
   */
  recordCredentialEvent(event) {
    this.incrementCounter(`credentials_${event}_total`);
    if (event === 'issued') {
      const activeCount = this.getMetric('credentials_active_total', 'gauge');
      if (activeCount) {
        this.setGauge('credentials_active_total', activeCount.value + 1);
      }
    } else if (event === 'revoked') {
      const activeCount = this.getMetric('credentials_active_total', 'gauge');
      if (activeCount) {
        this.setGauge('credentials_active_total', Math.max(0, activeCount.value - 1));
      }
    }
  }

  /**
   * Record reputation event
   */
  recordReputationEvent(eventType, score) {
    this.incrementCounter('reputation_events_total');
    this.incrementCounter('reputation_events_by_type_total', { type: eventType });
    
    // Update average score (simplified)
    const avgScore = this.getMetric('reputation_average_score', 'gauge');
    if (avgScore) {
      const currentAvg = avgScore.value;
      const newAvg = (currentAvg + score) / 2; // Simplified calculation
      this.setGauge('reputation_average_score', newAvg);
    }
  }

  /**
   * Record verification event
   */
  recordVerificationEvent(success, duration) {
    this.incrementCounter('verifications_requested_total');
    if (success) {
      this.incrementCounter('verifications_completed_total');
    } else {
      this.incrementCounter('verifications_failed_total');
    }
    this.observeHistogram('verification_duration_seconds', duration / 1000);
  }

  /**
   * Record cache event
   */
  recordCacheEvent(hit) {
    if (hit) {
      this.incrementCounter('cache_hits_total');
    } else {
      this.incrementCounter('cache_misses_total');
    }
  }

  /**
   * Record queue event
   */
  recordQueueEvent(event, queueName) {
    this.incrementCounter(`queue_jobs_${event}_total`, { queue: queueName });
    
    if (event === 'waiting') {
      const waitingCount = this.getMetric('queue_jobs_waiting_total', 'gauge');
      if (waitingCount) {
        this.setGauge('queue_jobs_waiting_total', waitingCount.value + 1);
      }
    } else if (event === 'active') {
      const activeCount = this.getMetric('queue_jobs_active_total', 'gauge');
      const waitingCount = this.getMetric('queue_jobs_waiting_total', 'gauge');
      if (activeCount && waitingCount) {
        this.setGauge('queue_jobs_active_total', activeCount.value + 1);
        this.setGauge('queue_jobs_waiting_total', Math.max(0, waitingCount.value - 1));
      }
    } else if (event === 'completed' || event === 'failed') {
      const activeCount = this.getMetric('queue_jobs_active_total', 'gauge');
      if (activeCount) {
        this.setGauge('queue_jobs_active_total', Math.max(0, activeCount.value - 1));
      }
    }
  }

  /**
   * Record database event
   */
  recordDatabaseEvent(queryType, duration) {
    this.incrementCounter('database_queries_total');
    this.incrementCounter('database_queries_by_type_total', { type: queryType });
    this.observeHistogram('database_query_duration_seconds', duration / 1000);
  }

  /**
   * Record error
   */
  recordError(errorType, errorMessage) {
    this.incrementCounter('errors_total');
    this.incrementCounter('errors_by_type_total', { type: errorType });
    logger.error('Error recorded:', { errorType, errorMessage });
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
      memory: process.memoryUsage(),
      metrics: this.getAllMetrics(),
    };

    return summary;
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusMetrics() {
    let output = '';
    
    // Export counters
    for (const [name, metric] of this.counters) {
      output += `# HELP ${name} ${metric.help}\n`;
      output += `# TYPE ${name} counter\n`;
      output += `${name} ${metric.value}\n\n`;
    }
    
    // Export gauges
    for (const [name, metric] of this.gauges) {
      output += `# HELP ${name} ${metric.help}\n`;
      output += `# TYPE ${name} gauge\n`;
      output += `${name} ${metric.value}\n\n`;
    }
    
    // Export histograms (simplified)
    for (const [name, metric] of this.histograms) {
      output += `# HELP ${name} ${metric.help}\n`;
      output += `# TYPE ${name} histogram\n`;
      output += `${name}_count ${metric.count}\n`;
      output += `${name}_sum ${metric.sum}\n`;
      if (metric.observations.length > 0) {
        const avg = metric.sum / metric.count;
        output += `${name}_avg ${avg}\n`;
      }
      output += '\n';
    }
    
    return output;
  }

  /**
   * Reset all metrics
   */
  resetMetrics() {
    for (const counter of this.counters.values()) {
      counter.value = 0;
    }
    
    for (const gauge of this.gauges.values()) {
      gauge.value = 0;
    }
    
    for (const histogram of this.histograms.values()) {
      histogram.observations = [];
      histogram.count = 0;
      histogram.sum = 0;
    }
    
    for (const timer of this.timers.values()) {
      timer.durations = [];
      timer.startTime = null;
    }
    
    logger.info('All metrics reset');
  }
}

module.exports = new MetricsService();
