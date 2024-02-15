// TrustKey IP Utility

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}

module.exports = { getClientIp };
