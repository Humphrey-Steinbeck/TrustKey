// TrustKey Rate Limit Headers Middleware

function rateLimitHeaders(windowMs, max) {
  return function (req, res, next) {
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Window', String(windowMs));
    next();
  };
}

module.exports = rateLimitHeaders;
