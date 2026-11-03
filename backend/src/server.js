const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');
const rewardRoutes = require('./routes/reward.routes');
const userRoutes = require('./routes/user.routes');
const hotspotRoutes = require('./routes/hotspot.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || [
  'https://ecosense.mukuvi.tech',
  'https://ecosense.84-12-76-11.sslip.io',
  'http://localhost:3000',
  'http://localhost:3100',
  'http://localhost:8081',
].join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

const uploadDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir, {
  dotfiles: 'deny',
  fallthrough: false,
  maxAge: '7d',
  immutable: true,
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ecosense-ai', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotspots', hotspotRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`EcoSense AI API running on port ${config.port} (${config.nodeEnv})`);
});

module.exports = app;
