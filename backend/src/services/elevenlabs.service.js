const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const config = require('../config');
const logger = require('../utils/logger');

const STATUS_TEXT = {
  pending: 'waiting for review',
  verified: 'verified',
  assigned: 'assigned to a cleanup team',
  in_progress: 'being cleaned up',
  resolved: 'cleaned up',
  rejected: 'rejected',
};

const API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

function buildNarration(report) {
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);
  const location = report.address || `latitude ${latitude.toFixed(4)}, longitude ${longitude.toFixed(4)}`;
  const status = STATUS_TEXT[report.status] || report.status;
  const points = Number(report.points_awarded) || 0;
  return `EcoSense update. Your ${report.waste_type} waste report at ${location} is ${status}. You earned ${points} points.`;
}

function cachePath(text, voiceId, modelId) {
  const key = crypto
    .createHash('sha256')
    .update(`${voiceId}:${modelId}:${text}`)
    .digest('hex');
  return path.join(path.resolve(config.audio.cacheDir), `${key}.mp3`);
}

async function synthesize(text) {
  const { apiKey, voiceId, modelId } = config.elevenlabs;

  if (!apiKey) {
    const error = new Error('ElevenLabs is not configured');
    error.code = 'ELEVENLABS_NOT_CONFIGURED';
    throw error;
  }

  const file = cachePath(text, voiceId, modelId);
  try {
    const cached = await fs.readFile(file);
    return { buffer: cached, contentType: 'audio/mpeg' };
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  let response;
  try {
    response = await fetch(`${API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({ text, model_id: modelId }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const detail = await response.text();
    logger.error(`ElevenLabs request failed (${response.status}): ${detail.slice(0, 200)}`);
    const error = new Error('Voice generation failed');
    error.code = 'ELEVENLABS_FAILED';
    throw error;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, buffer);

  return { buffer, contentType: 'audio/mpeg' };
}

module.exports = { buildNarration, synthesize };
