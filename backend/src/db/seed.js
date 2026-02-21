/**
 * EcoSense AI — Database Seeder
 * Inserts sample data for development and testing.
 */
const bcrypt = require('bcryptjs');
const { pool } = require('./index');
const logger = require('../utils/logger');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Admin user
    const adminHash = await bcrypt.hash('admin123', 12);
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, points_balance)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@ecosense.co.ke', adminHash, 'EcoSense Admin', '+254700000000', 'admin', 0]
    );

    // Sample citizen
    const citizenHash = await bcrypt.hash('citizen123', 12);
    const { rows: [citizen] } = await client.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, points_balance)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['jane@example.com', citizenHash, 'Jane Wanjiku', '+254711111111', 'citizen', 50]
    );

    // Sample field agent
    const agentHash = await bcrypt.hash('agent123', 12);
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, points_balance)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['agent@ecosense.co.ke', agentHash, 'David Oduor', '+254722222222', 'field_agent', 0]
    );

    // Sample waste reports (Nairobi locations)
    if (citizen) {
      await client.query(
        `INSERT INTO waste_reports (reporter_id, latitude, longitude, address, description, waste_type, severity, status, points_awarded)
         VALUES
         ($1, -1.2921, 36.8219, 'Tom Mboya St, Nairobi', 'Large pile of plastic waste near bus stop', 'plastic', 'high', 'pending', 10),
         ($1, -1.3000, 36.7800, 'Kibera, Nairobi', 'Mixed waste dumped along the river', 'mixed', 'critical', 'verified', 25),
         ($1, -1.2864, 36.8172, 'Moi Avenue, Nairobi', 'Electronic waste near market', 'electronic', 'medium', 'assigned', 10)`,
        [citizen.id]
      );
    }

    // Sample rewards
    await client.query(
      `INSERT INTO rewards (title, description, points_cost, category, quantity_available, is_active)
       VALUES
       ('M-PESA Airtime KES 50', 'Redeem for KES 50 Safaricom airtime', 100, 'airtime', 1000, true),
       ('Naivas Shopping Voucher KES 200', 'Shopping voucher for Naivas Supermarket', 400, 'voucher', 500, true),
       ('EcoSense T-Shirt', 'Branded EcoSense AI t-shirt', 250, 'merchandise', 200, true)
       ON CONFLICT DO NOTHING`
    );

    await client.query('COMMIT');
    logger.info('Database seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Seeding failed', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seed().catch(() => process.exit(1));
}

module.exports = { seed };
