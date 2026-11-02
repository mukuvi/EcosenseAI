const config = require('../config');
const logger = require('../utils/logger');

const cache = new Map();
let lastRequestAt = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanPart(value) {
  return value.replace(/\s+(division|ward|subcounty|county)$/i, '').trim();
}

function buildPlaceName(payload) {
  const address = payload.address || {};
  const road = cleanPart(address.road || address.pedestrian || address.footway || address.path || '');
  const area = cleanPart(
    address.suburb
    || address.neighbourhood
    || address.quarter
    || address.village
    || address.hamlet
    || address.town
    || address.city_district
    || ''
  );
  const city = cleanPart(address.city || address.town || address.municipality || address.county || address.state || '');

  const parts = [road, area, city].filter(Boolean);
  const unique = parts.filter((part, index) => parts.indexOf(part) === index);

  if (unique.length > 0) {
    return unique.slice(0, 3).join(', ');
  }

  if (payload.display_name) {
    return payload.display_name.split(',').slice(0, 3).join(',').trim();
  }

  return null;
}

async function reverse(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  if (cache.has(key)) return cache.get(key);

  const wait = Math.max(0, 1100 - (Date.now() - lastRequestAt));
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  try {
    const url = new URL(config.geocode.url);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('zoom', '18');
    url.searchParams.set('addressdetails', '1');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.geocode.timeoutMs);
    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': config.geocode.userAgent,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      logger.warn(`Reverse geocoding failed with status ${response.status}`);
      return null;
    }

    const payload = await response.json();
    const place = buildPlaceName(payload);
    if (place) cache.set(key, place);
    return place;
  } catch (err) {
    logger.warn(`Reverse geocoding unavailable: ${err.message}`);
    return null;
  }
}

module.exports = { reverse, buildPlaceName };
