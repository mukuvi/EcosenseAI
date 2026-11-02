const { validationResult } = require('express-validator');
const db = require('../db');
const config = require('../config');
const logger = require('../utils/logger');
const elevenlabs = require('../services/elevenlabs.service');
const aiService = require('../services/ai.service');
const notificationService = require('../services/notification.service');
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, address, description, waste_type, severity } = req.body;
    const imageUrls = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    const classification = req.files && req.files.length > 0
      ? await aiService.classifyImage(req.files[0])
      : null;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO waste_reports
          (reporter_id, latitude, longitude, address, description, waste_type, severity, image_urls, points_awarded, ai_waste_type, ai_confidence)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
          classification ? classification.wasteType : null,
          classification ? classification.confidence : null,
        ]
      );

      const report = rows[0];

      await client.query(
        `INSERT INTO report_status_history (report_id, from_status, to_status, changed_by, note)
         VALUES ($1, NULL, $2, $3, 'Report submitted')`,
        [report.id, report.status, req.user.id]
      );

      await client.query(
        'UPDATE users SET points_balance = points_balance + $1 WHERE id = $2',
        [config.points.perReport, req.user.id]
      );

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
exports.listMine = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['wr.reporter_id = $1'];
    const params = [req.user.id];

    if (status) {
      params.push(status);
      conditions.push(`wr.status = $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

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

    if (!canView(req.user, rows[0])) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { rows: assignmentRows } = await db.query(
      `SELECT ra.id, ra.status, ra.notes, ra.assigned_to, ra.created_at,
              u.full_name AS assigned_to_name
       FROM report_assignments ra
       JOIN users u ON u.id = ra.assigned_to
       WHERE ra.report_id = $1 AND ra.status IN ('assigned', 'in_progress')
       ORDER BY ra.created_at DESC
       LIMIT 1`,
      [req.params.id]
    );

    res.json({ report: { ...rows[0], assignment: assignmentRows[0] || null } });
  } catch (err) {
    next(err);
  }
};
exports.updateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!['admin', 'field_agent', 'organization'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { status } = req.body;
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows: currentRows } = await client.query(
        'SELECT * FROM waste_reports WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );

      if (currentRows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Report not found' });
      }

      const current = currentRows[0];

      if (req.user.role === 'field_agent') {
        const { rows: assignmentRows } = await client.query(
          `SELECT id FROM report_assignments
           WHERE report_id = $1 AND assigned_to = $2 AND status IN ('assigned', 'in_progress')`,
          [req.params.id, req.user.id]
        );

        if (assignmentRows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(403).json({ error: 'Report is not assigned to you' });
        }
      }

      if (current.status === status) {
        await client.query('COMMIT');
        return res.json({ report: current });
      }

      const { rows } = await client.query(
        `UPDATE waste_reports SET status = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [status, req.params.id]
      );

      const report = rows[0];

      await client.query(
        `INSERT INTO report_status_history (report_id, from_status, to_status, changed_by)
         VALUES ($1, $2, $3, $4)`,
        [report.id, current.status, status, req.user.id]
      );

      if (status === 'in_progress' || status === 'resolved') {
        await client.query(
          `UPDATE report_assignments
           SET status = $1,
               completed_at = CASE WHEN $2 THEN NOW() ELSE completed_at END,
               updated_at = NOW()
           WHERE report_id = $3 AND status IN ('assigned', 'in_progress')`,
          [status === 'resolved' ? 'completed' : 'in_progress', status === 'resolved', report.id]
        );
      }

      if (status === 'rejected') {
        await client.query(
          `UPDATE report_assignments
           SET status = 'cancelled', updated_at = NOW()
           WHERE report_id = $1 AND status IN ('assigned', 'in_progress')`,
          [report.id]
        );
      }

      if (status === 'verified') {
        const bonusPoints = config.points.perVerifiedReport - config.points.perReport;
        if (bonusPoints > 0) {
          await client.query(
            'UPDATE users SET points_balance = points_balance + $1 WHERE id = $2',
            [bonusPoints, report.reporter_id]
          );
          await client.query(
            `INSERT INTO point_transactions (user_id, amount, type, reference_type, reference_id, description)
             VALUES ($1, $2, 'bonus', 'waste_report', $3, 'Bonus points for verified report')`,
            [report.reporter_id, bonusPoints, report.id]
          );
        }
      }

      await client.query('COMMIT');

      notificationService.create(report.reporter_id, {
        type: 'report_status',
        title: 'Report update',
        body: `Your ${report.waste_type} report is now ${status.replace('_', ' ')}.`,
        data: { reportId: report.id, status },
      }).catch((err) => logger.warn(`Notification failed: ${err.message}`));

      logger.info(`Report ${report.id} status updated to ${status}`);
      res.json({ report });
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
exports.getHistory = async (req, res, next) => {
  try {
    const { rows: reportRows } = await db.query(
      'SELECT reporter_id FROM waste_reports WHERE id = $1',
      [req.params.id]
    );

    if (reportRows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (!canView(req.user, reportRows[0])) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { rows } = await db.query(
      `SELECT h.id, h.from_status, h.to_status, h.note, h.created_at,
              u.full_name AS changed_by_name
       FROM report_status_history h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.report_id = $1
       ORDER BY h.created_at ASC`,
      [req.params.id]
    );

    res.json({ history: rows });
  } catch (err) {
    next(err);
  }
};

exports.listAssigned = async (req, res, next) => {
  try {
    if (req.user.role !== 'field_agent') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { rows } = await db.query(
      `SELECT wr.*, u.full_name AS reporter_name,
              ra.id AS assignment_id, ra.status AS assignment_status,
              ra.created_at AS assigned_at
       FROM report_assignments ra
       JOIN waste_reports wr ON wr.id = ra.report_id
       JOIN users u ON u.id = wr.reporter_id
       WHERE ra.assigned_to = $1 AND ra.status IN ('assigned', 'in_progress')
       ORDER BY ra.created_at DESC`,
      [req.user.id]
    );

    res.json({ reports: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
};

exports.assign = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!['admin', 'organization'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { assigned_to, notes } = req.body;
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const { rows: reportRows } = await client.query(
        'SELECT * FROM waste_reports WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );

      if (reportRows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Report not found' });
      }

      const current = reportRows[0];

      const { rows: agentRows } = await client.query(
        `SELECT id, full_name, email FROM users
         WHERE id = $1 AND role = 'field_agent' AND is_active = true`,
        [assigned_to]
      );

      if (agentRows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Field agent not found' });
      }

      const agent = agentRows[0];

      await client.query(
        `UPDATE report_assignments
         SET status = 'cancelled', updated_at = NOW()
         WHERE report_id = $1 AND status IN ('assigned', 'in_progress')`,
        [req.params.id]
      );

      const { rows: assignmentRows } = await client.query(
        `INSERT INTO report_assignments (report_id, assigned_to, assigned_by, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.params.id, agent.id, req.user.id, notes || null]
      );

      const { rows } = await client.query(
        `UPDATE waste_reports SET status = 'assigned', updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [req.params.id]
      );

      const report = rows[0];

      await client.query(
        `INSERT INTO report_status_history (report_id, from_status, to_status, changed_by, note)
         VALUES ($1, $2, 'assigned', $3, $4)`,
        [report.id, current.status, req.user.id, `Assigned to ${agent.full_name}`]
      );

      await client.query('COMMIT');

      notificationService.create(agent.id, {
        type: 'assignment',
        title: 'New report assigned',
        body: `${report.waste_type} waste at ${report.address || 'a reported location'} needs attention.`,
        data: { reportId: report.id },
      }).catch((err) => logger.warn(`Notification failed: ${err.message}`));

      notificationService.create(report.reporter_id, {
        type: 'report_assigned',
        title: 'Report assigned',
        body: `Your ${report.waste_type} report was assigned to ${agent.full_name}.`,
        data: { reportId: report.id },
      }).catch((err) => logger.warn(`Notification failed: ${err.message}`));

      logger.info(`Report ${report.id} assigned to ${agent.id}`);

      res.json({
        report: {
          ...report,
          assignment: {
            ...assignmentRows[0],
            assigned_to_name: agent.full_name,
          },
        },
      });
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

exports.getAudio = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM waste_reports WHERE id = $1', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = rows[0];

    if (!canView(req.user, report)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { buffer, contentType } = await elevenlabs.synthesize(elevenlabs.buildNarration(report));

    res.set({
      'Content-Type': contentType,
      'Content-Length': buffer.length,
      'Cache-Control': 'private, max-age=3600',
    });
    res.send(buffer);
  } catch (err) {
    if (err.code === 'ELEVENLABS_NOT_CONFIGURED') {
      return res.status(503).json({ error: 'Voice playback is not configured' });
    }
    if (err.code === 'ELEVENLABS_FAILED') {
      return res.status(502).json({ error: 'Voice generation failed' });
    }
    next(err);
  }
};

const STAFF_ROLES = ['admin', 'field_agent', 'organization'];

function canView(user, report) {
  return report.reporter_id === user.id || STAFF_ROLES.includes(user.role);
}
