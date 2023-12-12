// TrustKey Parse Utility

function parseBoolean(val, defaultValue = false) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const v = val.toLowerCase();
    if (['true','1','yes','y','on'].includes(v)) return true;
    if (['false','0','no','n','off'].includes(v)) return false;
  }
  return defaultValue;
}

module.exports = { parseBoolean };
