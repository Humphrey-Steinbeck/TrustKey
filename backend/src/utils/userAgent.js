// TrustKey User Agent Parser

function parseUserAgent(ua) {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
  const isBot = /bot|crawler|spider/i.test(ua);
  return { userAgent: ua, isMobile, isBot };
}

module.exports = { parseUserAgent };
