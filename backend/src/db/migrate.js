/**
 * EcoSense AI — Database Migration
 * Creates all required tables for the platform.
 */
const { pool } = require('./index');
const logger = require('../utils/logger');

const migration = `
-- Enable PostGIS extension for geospatial data (install if available)
-- CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'field_agent')),
  points_balance INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WASTE REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS waste_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  description TEXT,
  waste_type VARCHAR(50) CHECK (waste_type IN (
    'plastic', 'organic', 'electronic', 'hazardous',
    'construction', 'medical', 'textile', 'mixed', 'other'
  )),
  ai_waste_type VARCHAR(50),
  ai_confidence REAL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected'
  )),
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  points_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REPORT ASSIGNMENTS (for field agents / government teams)
-- ============================================================
CREATE TABLE IF NOT EXISTS report_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES waste_reports(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points_cost INT NOT NULL,
  category VARCHAR(50),
  image_url TEXT,
  quantity_available INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REWARD REDEMPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  points_spent INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'redeemed', 'cancelled')),
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- POINT TRANSACTIONS (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'adjustment')),
  reference_type VARCHAR(30),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HOTSPOTS (AI-predicted waste accumulation areas)
-- ============================================================
CREATE TABLE IF NOT EXISTS hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters REAL NOT NULL DEFAULT 500,
  risk_score REAL NOT NULL DEFAULT 0.5,
  report_count INT NOT NULL DEFAULT 0,
  last_predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_waste_reports_reporter ON waste_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_waste_reports_status ON waste_reports(status);
CREATE INDEX IF NOT EXISTS idx_waste_reports_location ON waste_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_report_assignments_report ON report_assignments(report_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_hotspots_location ON hotspots(latitude, longitude);
`;

async function migrate() {
  try {
    logger.info('Running database migrations...');
    await pool.query(migration);
    logger.info('Migrations completed successfully.');
  } catch (err) {
    logger.error('Migration failed', err);
    throw err;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate().catch(() => process.exit(1));
}

module.exports = { migrate };
