// TrustKey HPP (HTTP Parameter Pollution) Middleware

function hpp(req, res, next) {
  ['query', 'body', 'params'].forEach((k) => {
    if (req[k] && typeof req[k] === 'object') {
      for (const key in req[k]) {
        const val = req[k][key];
        if (Array.isArray(val)) {
          req[k][key] = val[val.length - 1];
        }
      }
    }
  });
  next();
}

module.exports = hpp;
