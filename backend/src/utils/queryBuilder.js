// TrustKey Query Builder Utility

function buildQuery(params) {
  const query = {};
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      query[key] = val;
    }
  }
  return query;
}

module.exports = { buildQuery };
