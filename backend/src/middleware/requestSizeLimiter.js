// TrustKey Request Size Limiter

function requestSizeLimiter(maxBytes = 1_000_000) {
  return function (req, res, next) {
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        req.pause();
        res.status(413).json({ success: false, error: 'Payload Too Large' });
      }
    });
    next();
  };
}

module.exports = requestSizeLimiter;
