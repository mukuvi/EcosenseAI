const db = require('../db');

/**
 * GET /api/hotspots
 */
exports.list = async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM hotspots
       ORDER BY risk_score DESC
       LIMIT 100`
    );
    res.json({ hotspots: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/hotspots/:id
 */
exports.getById = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM hotspots WHERE id = $1', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hotspot not found' });
    }

    // Fetch nearby reports
    const hotspot = rows[0];
    const { rows: nearbyReports } = await db.query(
      `SELECT id, latitude, longitude, waste_type, severity, status, created_at
       FROM waste_reports
       WHERE ABS(latitude - $1) < 0.01 AND ABS(longitude - $2) < 0.01
       ORDER BY created_at DESC
       LIMIT 20`,
      [hotspot.latitude, hotspot.longitude]
    );

    res.json({ hotspot, nearby_reports: nearbyReports });
  } catch (err) {
    next(err);
  }
};
