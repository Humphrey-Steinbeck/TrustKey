// TrustKey URL Utility

function buildUrl(base, path, params = {}) {
  const url = new URL(path, base);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null) {
      url.searchParams.append(key, String(val));
    }
  }
  return url.toString();
}

module.exports = { buildUrl };
