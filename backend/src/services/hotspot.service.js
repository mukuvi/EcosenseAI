const db = require('../db');
const config = require('../config');
const logger = require('../utils/logger');

let refreshPromise = null;

async function refresh() {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function runRefresh() {
  try {
    const { rows } = await db.query(
      `SELECT
         (SELECT COUNT(*)::int FROM waste_reports) AS report_count,
         (SELECT COUNT(*)::int FROM hotspots) AS hotspot_count,
         (SELECT MAX(updated_at) FROM waste_reports) AS report_updated,
         (SELECT MAX(last_predicted_at) FROM hotspots) AS hotspot_updated`
    );

    const state = rows[0];
    if (!state || state.report_count < 2) return;

    if (
      state.hotspot_count > 0 &&
      state.hotspot_updated &&
      state.report_updated &&
      new Date(state.hotspot_updated) >= new Date(state.report_updated)
    ) {
      return;
    }

    const { rows: reports } = await db.query(
      `SELECT latitude, longitude, waste_type, severity
       FROM waste_reports
       ORDER BY created_at DESC
       LIMIT 500`
    );

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.ai.timeoutMs);
    let response;
    try {
      response = await fetch(`${config.ai.serviceUrl}/ai/hotspots/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports, eps_km: 0.5, min_samples: 2 }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      logger.warn(`Hotspot prediction failed with status ${response.status}`);
      return;
    }

    const payload = await response.json();
    const hotspots = Array.isArray(payload.hotspots) ? payload.hotspots : [];

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM hotspots');

      for (const hotspot of hotspots) {
        await client.query(
          `INSERT INTO hotspots (latitude, longitude, radius_meters, risk_score, report_count, last_predicted_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            hotspot.latitude,
            hotspot.longitude,
            hotspot.radius_meters || 500,
            hotspot.risk_score || 0.5,
            hotspot.report_count || 0,
          ]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.warn(`Hotspot refresh unavailable: ${err.message}`);
  }
}

module.exports = { refresh };
