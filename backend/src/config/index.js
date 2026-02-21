require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'ecosense_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
  },

  points: {
    perReport: parseInt(process.env.POINTS_PER_REPORT, 10) || 10,
    perVerifiedReport: parseInt(process.env.POINTS_PER_VERIFIED_REPORT, 10) || 25,
  },
};

module.exports = config;
