const db = require('../db');

/**
 * GET /api/users/points
 */
exports.getPoints = async (req, res, next) => {
  try {
    const { rows: userRows } = await db.query(
      'SELECT points_balance FROM users WHERE id = $1',
      [req.user.id]
    );

    const { rows: transactions } = await db.query(
      'SELECT * FROM point_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    res.json({
      points_balance: userRows[0]?.points_balance || 0,
      transactions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users (admin)
 */
exports.listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { rows } = await db.query(
      `SELECT id, email, full_name, phone, role, points_balance, is_active, created_at
       FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM users');

    res.json({
      users: rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/:id/role (admin)
 */
exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['citizen', 'admin', 'field_agent'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { rows } = await db.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, role',
      [role, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};
