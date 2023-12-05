// TrustKey Async Wrapper

async function asyncWrap(promise) {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err, null];
  }
}

module.exports = { asyncWrap };
