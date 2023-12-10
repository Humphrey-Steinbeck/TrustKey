// TrustKey Request ID Middleware

function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || (Date.now().toString(36) + Math.random().toString(36).substr(2));
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}

module.exports = requestId;
