const fs = require('fs/promises');
const path = require('path');

const config = require('../config');
const logger = require('../utils/logger');

async function classifyImage(file) {
  if (!file || !file.path) return null;

  try {
    const buffer = await fs.readFile(file.path);
    const form = new FormData();
    form.append(
      'image',
      new Blob([buffer], { type: file.mimetype }),
      file.filename || path.basename(file.path)
    );

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.ai.timeoutMs);
    let response;
    try {
      response = await fetch(`${config.ai.serviceUrl}/ai/classify`, {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      logger.warn(`AI classification failed with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (!data || !data.waste_type) return null;

    return {
      wasteType: data.waste_type,
      confidence: Number(data.confidence) || 0,
    };
  } catch (err) {
    logger.warn(`AI classification unavailable: ${err.message}`);
    return null;
  }
}

module.exports = { classifyImage };
