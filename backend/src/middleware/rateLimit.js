const attempts = new Map();

function clientKey(req) {
  return req.headers['cf-connecting-ip'] || req.ip || 'unknown';
}

function rateLimit({ windowMs = 15 * 60 * 1000, max = 20 } = {}) {
  return (req, res, next) => {
    const key = clientKey(req);
    const now = Date.now();
    const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    attempts.set(key, entry);

    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.set('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }

    next();
  };
}

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts.entries()) {
    if (now > entry.resetAt) attempts.delete(key);
  }
}, 10 * 60 * 1000);
cleanup.unref();

module.exports = rateLimit;
