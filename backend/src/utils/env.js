// TrustKey Env Utility

function getEnv(key, defaultValue = undefined) {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value;
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error();
  }
  return value;
}

module.exports = { getEnv, requireEnv };
