// TrustKey Request Timer Middleware

function timer(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', );
  });
  next();
}

module.exports = timer;
