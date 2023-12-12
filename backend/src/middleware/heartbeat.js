// TrustKey Health Middleware (simple)

function heartbeat(req, res, next) {
  res.setHeader('X-Heartbeat', '1');
  next();
}

module.exports = heartbeat;
