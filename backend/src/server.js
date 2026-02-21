const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');
const rewardRoutes = require('./routes/reward.routes');
const userRoutes = require('./routes/user.routes');
const hotspotRoutes = require('./routes/hotspot.routes');

const app = express();

// --------------- Middleware ---------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Ensure upload directory exists
const uploadDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// --------------- API Routes ---------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ecosense-ai', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotspots', hotspotRoutes);

// --------------- Error Handling ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
app.listen(config.port, () => {
  logger.info(`🌍 EcoSense AI API running on port ${config.port} (${config.nodeEnv})`);
});

module.exports = app;
