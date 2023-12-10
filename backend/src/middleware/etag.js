// TrustKey ETag Middleware

const crypto = require('crypto');

function etag(req, res, next) {
  const oldSend = res.send;
  res.send = function (body) {
    try {
      const hash = crypto.createHash('md5').update(body).digest('hex');
      res.setHeader('ETag', );
    } catch {}
    return oldSend.call(this, body);
  };
  next();
}

module.exports = etag;
