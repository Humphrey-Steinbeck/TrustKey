// TrustKey Safe JSON Middleware

function safeJson(req, res, next) {
  const oldJson = res.json;
  res.json = function (body) {
    try {
      return oldJson.call(this, body);
    } catch (e) {
      return oldJson.call(this, { success: false, error: 'Serialization Error' });
    }
  };
  next();
}

module.exports = safeJson;
