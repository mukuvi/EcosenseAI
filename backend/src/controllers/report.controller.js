const { validationResult } = require('express-validator');
const db = require('../db');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * POST /api/reports
 */
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, address, description, waste_type, severity } = req.body;
    const imageUrls = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Create the report
      const { rows } = await client.query(
        `INSERT INTO waste_reports
          (reporter_id, latitude, longitude, address, description, waste_type, severity, image_urls, points_awarded)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          req.user.id,
          latitude,
          longitude,
          address || null,
          description || null,
          waste_type || 'other',
          severity || 'medium',
          imageUrls,
          config.points.perReport,
        ]
      );

      const report = rows[0];

      // Award points to the reporter
      await client.query(
        'UPDATE users SET points_balance = points_balance + $1 WHERE id = $2',
        [config.points.perReport, req.user.id]
      );

      // Log point transaction
      await client.query(
        `INSERT INTO point_transactions (user_id, amount, type, reference_type, reference_id, description)
         VALUES ($1, $2, 'earned', 'waste_report', $3, 'Points earned for waste report')`,
        [req.user.id, config.points.perReport, report.id]
      );

      await client.query('COMMIT');

      logger.info(`Report created: ${report.id} by user ${req.user.id}`);
      res.status(201).json({ report });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports
 */
exports.list = async (req, res, next) => {
  try {
    const { status, waste_type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`wr.status = $${params.length}`);
    }
    if (waste_type) {
      params.push(waste_type);
      conditions.push(`wr.waste_type = $${params.length}`);
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    params.push(limit, offset);

    const { rows } = await db.query(
      `SELECT wr.*, u.full_name as reporter_name
       FROM waste_reports wr
       JOIN users u ON wr.reporter_id = u.id
       ${whereClause}
       ORDER BY wr.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM waste_reports wr ${whereClause}`,
      params.slice(0, params.length - 2)
    );

    res.json({
      reports: rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/:id
 */
exports.getById = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT wr.*, u.full_name as reporter_name
       FROM waste_reports wr
       JOIN users u ON wr.reporter_id = u.id
       WHERE wr.id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/reports/:id/status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admin or field_agent can update status
    if (!['admin', 'field_agent'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { status } = req.body;
    const { rows } = await db.query(
      `UPDATE waste_reports SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = rows[0];

    // Award bonus points if report is verified
    if (status === 'verified') {
      const bonusPoints = config.points.perVerifiedReport - config.points.perReport;
      if (bonusPoints > 0) {
        await db.query(
          'UPDATE users SET points_balance = points_balance + $1 WHERE id = $2',
          [bonusPoints, report.reporter_id]
        );
        await db.query(
          `INSERT INTO point_transactions (user_id, amount, type, reference_type, reference_id, description)
           VALUES ($1, $2, 'bonus', 'waste_report', $3, 'Bonus points for verified report')`,
          [report.reporter_id, bonusPoints, report.id]
        );
      }
    }

    logger.info(`Report ${report.id} status updated to ${status}`);
    res.json({ report });
  } catch (err) {
    next(err);
  }
};
