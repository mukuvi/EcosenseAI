const db = require('../db');
const logger = require('../utils/logger');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function create(userId, { type, title, body, data = {} }) {
  const { rows } = await db.query(
    `INSERT INTO notifications (user_id, type, title, body, data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, type, title, body || null, data]
  );

  const notification = rows[0];
  sendPush(userId, notification).catch((err) => {
    logger.warn(`Push notification failed: ${err.message}`);
  });

  return notification;
}

async function sendPush(userId, notification) {
  const { rows } = await db.query(
    'SELECT token FROM push_tokens WHERE user_id = $1 LIMIT 100',
    [userId]
  );

  if (rows.length === 0) return;

  const messages = rows.map((row) => ({
    to: row.token,
    title: notification.title,
    body: notification.body || undefined,
    data: notification.data || {},
    sound: 'default',
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    logger.warn(`Expo push request failed with status ${response.status}`);
    return;
  }

  const payload = await response.json();
  const tickets = Array.isArray(payload.data) ? payload.data : [];
  const invalidTokens = [];

  tickets.forEach((ticket, index) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      invalidTokens.push(rows[index].token);
    }
  });

  if (invalidTokens.length > 0) {
    await db.query('DELETE FROM push_tokens WHERE token = ANY($1)', [invalidTokens]);
  }
}

module.exports = { create };
