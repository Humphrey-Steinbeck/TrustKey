// TrustKey Response Helpers

function ok(res, data, message = 'OK') {
  return res.status(200).json({ success: true, data, message });
}

function created(res, data, message = 'Created') {
  return res.status(201).json({ success: true, data, message });
}

function noContent(res) {
  return res.status(204).send();
}

function badRequest(res, error = 'Bad Request') {
  return res.status(400).json({ success: false, error });
}

function unauthorized(res, error = 'Unauthorized') {
  return res.status(401).json({ success: false, error });
}

function forbidden(res, error = 'Forbidden') {
  return res.status(403).json({ success: false, error });
}

function notFound(res, error = 'Not Found') {
  return res.status(404).json({ success: false, error });
}

function conflict(res, error = 'Conflict') {
  return res.status(409).json({ success: false, error });
}

function tooMany(res, error = 'Too Many Requests') {
  return res.status(429).json({ success: false, error });
}

function serverError(res, error = 'Internal Server Error') {
  return res.status(500).json({ success: false, error });
}

module.exports = { ok, created, noContent, badRequest, unauthorized, forbidden, notFound, conflict, tooMany, serverError };
