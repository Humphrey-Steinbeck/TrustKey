// TrustKey JWT Utility

const jwt = require('jsonwebtoken');

function sign(payload, expiresIn = '1h') {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn });
}

function verify(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
}

module.exports = { sign, verify };
