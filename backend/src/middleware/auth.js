const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

/**
 * Authentication middleware — verifies JWT from Authorization header.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    db.query('SELECT id, email, role, is_active FROM users WHERE id = $1', [decoded.id])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        const dbUser = rows[0];
        if (!dbUser.is_active) {
          return res.status(401).json({ error: 'Account is blocked' });
        }

        req.user = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
        };
        next();
      })
      .catch(() => res.status(401).json({ error: 'Invalid or expired token' }));
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Authorization middleware — restricts access to specific roles.
 * @param  {...string} roles - Allowed roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
