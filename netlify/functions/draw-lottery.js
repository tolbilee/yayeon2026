const crypto = require('crypto');

const START_MINUTES = 18 * 60 + 30;
const END_MINUTES = 19 * 60 + 50;
const MAX_WINNERS = 2;
const WIN_RATE = Number(process.env.LOTTERY_WIN_RATE || '0.15');

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function getKstParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    dateKey: `${map.year}-${map.month}-${map.day}`,
    minutes: Number(map.hour) * 60 + Number(map.minute),
  };
}

function hashVisitorId(visitorId) {
  const salt = process.env.LOTTERY_VISITOR_SALT || 'yayeon-2026-lottery';
  return crypto.createHash('sha256').update(`${salt}:${visitorId}`).digest('hex');
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');

  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    'content-type': 'application/json',
  };
}

function supabaseUrl(path) {
  const base = process.env.SUPABASE_URL;
  if (!base) throw new Error('SUPABASE_URL is not configured.');
  return `${base.replace(/\/$/, '')}/rest/v1/${path}`;
}

async function callRpc(name, body) {
  const response = await fetch(supabaseUrl(`rpc/${name}`), {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase RPC failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return json(405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }

    const { dateKey, minutes } = getKstParts();
    if (minutes < START_MINUTES || minutes > END_MINUTES) {
      return json(200, { ok: false, code: 'OUT_OF_TIME', result: 'closed' });
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { ok: false, code: 'INVALID_JSON' });
    }

    if (!payload.visitorId || typeof payload.visitorId !== 'string') {
      return json(400, { ok: false, code: 'VISITOR_REQUIRED' });
    }

    const visitorHash = hashVisitorId(payload.visitorId);
    const result = await callRpc('draw_yayeon_lottery', {
      p_event_date: dateKey,
      p_visitor_hash: visitorHash,
      p_max_winners: MAX_WINNERS,
      p_win_rate: WIN_RATE,
    });

    if (!result || !result.result) {
      return json(502, { ok: false, code: 'INVALID_SUPABASE_RESPONSE' });
    }

    return json(200, {
      ok: true,
      code: result.code || 'DRAW_COMPLETE',
      result: result.result,
    });
  } catch (error) {
    console.error('draw-lottery failed:', error);
    return json(500, { ok: false, code: 'SERVER_ERROR' });
  }
};
