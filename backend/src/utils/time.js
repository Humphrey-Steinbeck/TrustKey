// TrustKey Time Utility

function nowIso() {
  return new Date().toISOString();
}

function toUnix(date = new Date()) {
  return Math.floor(new Date(date).getTime() / 1000);
}

function fromUnix(ts) {
  return new Date(ts * 1000);
}

module.exports = { nowIso, toUnix, fromUnix };
