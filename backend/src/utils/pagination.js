// TrustKey Pagination Utility

function getPagination({ page = 1, limit = 20 } = {}) {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildPaginatedResponse(items, total, { page, limit }) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data: items,
    pagination: { page, limit, total, totalPages },
  };
}

module.exports = { getPagination, buildPaginatedResponse };
