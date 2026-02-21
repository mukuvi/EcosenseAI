const { validationResult } = require('express-validator');
const db = require('../db');
const logger = require('../utils/logger');

/**
 * GET /api/rewards
 */
exports.list = async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM rewards WHERE is_active = true ORDER BY points_cost ASC'
    );
    res.json({ rewards: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/rewards/:id/redeem
 */
exports.redeem = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Get the reward
    const { rows: rewardRows } = await client.query(
      'SELECT * FROM rewards WHERE id = $1 AND is_active = true FOR UPDATE',
      [req.params.id]
    );

    if (rewardRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reward not found' });
    }

    const reward = rewardRows[0];

    // Check user balance
    const { rows: userRows } = await client.query(
      'SELECT points_balance FROM users WHERE id = $1 FOR UPDATE',
      [req.user.id]
    );

    const user = userRows[0];
    if (user.points_balance < reward.points_cost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient points' });
    }

    if (reward.quantity_available <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Reward out of stock' });
    }

    // Deduct points
    await client.query(
      'UPDATE users SET points_balance = points_balance - $1 WHERE id = $2',
      [reward.points_cost, req.user.id]
    );

    // Decrement reward quantity
    await client.query(
      'UPDATE rewards SET quantity_available = quantity_available - 1 WHERE id = $1',
      [reward.id]
    );

    // Create redemption record
    const { rows: redemptionRows } = await client.query(
      `INSERT INTO reward_redemptions (user_id, reward_id, points_spent, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [req.user.id, reward.id, reward.points_cost]
    );

    // Log point transaction
    await client.query(
      `INSERT INTO point_transactions (user_id, amount, type, reference_type, reference_id, description)
       VALUES ($1, $2, 'redeemed', 'reward', $3, $4)`,
      [req.user.id, -reward.points_cost, reward.id, `Redeemed: ${reward.title}`]
    );

    await client.query('COMMIT');

    logger.info(`User ${req.user.id} redeemed reward ${reward.id}`);
    res.status(201).json({ redemption: redemptionRows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * POST /api/rewards (admin)
 */
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, points_cost, category, image_url, quantity_available } = req.body;

    const { rows } = await db.query(
      `INSERT INTO rewards (title, description, points_cost, category, image_url, quantity_available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description || null, points_cost, category || null, image_url || null, quantity_available]
    );

    res.status(201).json({ reward: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/rewards/:id (admin)
 */
exports.update = async (req, res, next) => {
  try {
    const { title, description, points_cost, category, image_url, quantity_available, is_active } = req.body;

    const { rows } = await db.query(
      `UPDATE rewards SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        points_cost = COALESCE($3, points_cost),
        category = COALESCE($4, category),
        image_url = COALESCE($5, image_url),
        quantity_available = COALESCE($6, quantity_available),
        is_active = COALESCE($7, is_active),
        updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, description, points_cost, category, image_url, quantity_available, is_active, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ reward: rows[0] });
  } catch (err) {
    next(err);
  }
};
