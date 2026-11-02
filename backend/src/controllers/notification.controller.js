const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    const { rows: countRows } = await db.query(
      'SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id = $1 AND read_at IS NULL',
      [req.user.id]
    );

    res.json({ notifications: rows, unread: countRows[0].unread });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const { rowCount } = await db.query(
      'UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL',
      [req.user.id]
    );

    res.json({ updated: rowCount });
  } catch (err) {
    next(err);
  }
};

exports.registerPushToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;

    if (typeof token !== 'string' || token.trim().length < 10) {
      return res.status(400).json({ error: 'Invalid push token' });
    }

    const { rows } = await db.query(
      `INSERT INTO push_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (token) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         platform = EXCLUDED.platform,
         last_seen_at = NOW()
       RETURNING id, token, platform`,
      [req.user.id, token.trim(), platform || null]
    );

    res.status(201).json({ push_token: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.removePushToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    await db.query(
      'DELETE FROM push_tokens WHERE token = $1 AND user_id = $2',
      [token, req.user.id]
    );

    res.json({ removed: true });
  } catch (err) {
    next(err);
  }
};
