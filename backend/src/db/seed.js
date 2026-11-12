const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('./index');
const logger = require('../utils/logger');

function generatedPassword() {
  return crypto.randomBytes(12).toString('base64url');
}

async function seedAdmin(client) {
  const isProduction = process.env.NODE_ENV === 'production';
  const configured = process.env.SEED_ADMIN_PASSWORD;

  if (isProduction && !configured) {
    throw new Error('SEED_ADMIN_PASSWORD must be set when seeding in production');
  }

  const password = configured || generatedPassword();
  const passwordHash = await bcrypt.hash(password, 12);

  await client.query(
    `INSERT INTO users (email, password_hash, full_name, phone, role, points_balance, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       role = 'admin',
       is_active = true`,
    ['admin@gmail.com', passwordHash, 'Main Admin', '+254700000001', 'admin', 0]
  );

  if (!configured) {
    logger.warn(`Generated administrator password for admin@gmail.com: ${password}`);
  }
}

async function seedDemoData(client) {
  const hash = (value) => bcrypt.hash(value, 12);

  const { rows: [citizen] } = await client.query(
    `INSERT INTO users (email, password_hash, full_name, phone, role, points_balance)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    ['jane@example.com', await hash('citizen123'), 'Jane Wanjiku', '+254711111111', 'citizen', 50]
  );

  await client.query(
    `INSERT INTO users (email, password_hash, full_name, phone, role, points_balance)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO NOTHING`,
    ['agent@ecosense.co.ke', await hash('agent123'), 'David Oduor', '+254722222222', 'field_agent', 0]
  );

  await client.query(
    `INSERT INTO users (email, password_hash, full_name, phone, role, points_balance)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO NOTHING`,
    ['org@ecosense.co.ke', await hash('org123'), 'EcoSense Partner Org', '+254733333333', 'organization', 0]
  );

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

  await client.query(
    `INSERT INTO rewards (title, description, points_cost, category, quantity_available, is_active)
     VALUES
     ('M-PESA Airtime KES 50', 'Redeem for KES 50 Safaricom airtime', 100, 'airtime', 1000, true),
     ('Naivas Shopping Voucher KES 200', 'Shopping voucher for Naivas Supermarket', 400, 'voucher', 500, true),
     ('EcoSense T-Shirt', 'Branded EcoSense AI t-shirt', 250, 'merchandise', 200, true)
     ON CONFLICT DO NOTHING`
  );

  logger.info('Demo users, reports and rewards seeded.');
}

async function seed() {
  const client = await pool.connect();
  const demoEnabled = process.env.SEED_DEMO_DATA === 'true' || process.env.NODE_ENV !== 'production';

  try {
    await client.query('BEGIN');
    await seedAdmin(client);

    if (demoEnabled) {
      await seedDemoData(client);
    }

    await client.query('COMMIT');
    logger.info('Database seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Database seed failed', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
