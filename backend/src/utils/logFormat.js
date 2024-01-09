// TrustKey Logger Formatter

function formatLog(level, message, meta = {}) {
  return JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
}

module.exports = { formatLog };
