const db = require('../db');
const geocodeService = require('../services/geocode.service');
const logger = require('../utils/logger');

async function main() {
  const { rows } = await db.query(
    `SELECT id, latitude, longitude
     FROM waste_reports
     WHERE address IS NULL OR TRIM(address) = ''
     ORDER BY created_at ASC`
  );

  logger.info(`Geocoding ${rows.length} reports`);

  for (const report of rows) {
    const place = await geocodeService.reverse(report.latitude, report.longitude);
    if (place) {
      await db.query(
        'UPDATE waste_reports SET address = $1, updated_at = NOW() WHERE id = $2',
        [place, report.id]
      );
      logger.info(`Report ${report.id} geocoded to ${place}`);
    } else {
      logger.warn(`Report ${report.id} could not be geocoded`);
    }
  }

  logger.info('Geocoding complete');
}

if (require.main === module) {
  main()
    .then(() => db.pool.end())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Geocoding failed', err);
      db.pool.end().finally(() => process.exit(1));
    });
}

module.exports = { main };
