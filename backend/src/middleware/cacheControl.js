// TrustKey Caching Headers Middleware

function cacheControl(maxAge = 60) {
  return function (req, res, next) {
    res.setHeader('Cache-Control', );
    next();
  };
}

module.exports = cacheControl;
