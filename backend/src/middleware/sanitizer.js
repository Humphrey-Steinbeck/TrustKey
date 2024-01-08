// TrustKey Sanitizer Middleware

function sanitizer(req, res, next) {
  const sanitize = (val) => typeof val === 'string' ? val.replace(/[<>]/g, '') : val;
  ['body', 'query', 'params', 'headers'].forEach((key) => {
    if (req[key] && typeof req[key] === 'object') {
      for (const k in req[key]) {
        req[key][k] = sanitize(req[key][k]);
      }
    }
  });
  next();
}

module.exports = sanitizer;
