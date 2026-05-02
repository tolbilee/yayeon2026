const crypto = require('crypto');

const COOKIE_NAME = 'yayeon_letter_sid';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, part) => {
    const index = part.indexOf('=');
    if (index === -1) return cookies;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');
}

function makeDisplayCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[crypto.randomInt(alphabet.length)];
  }
  return code;
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

function getToken(event) {
  const queryToken = event.queryStringParameters && event.queryStringParameters.token;
  if (queryToken) return queryToken;

  const match = (event.path || '').match(/\/s\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function getProgressMessage(foundCount) {
  if (foundCount >= 3) return '편지 3통을 모두 찾았습니다.';
  if (foundCount > 0) return `편지 ${foundCount}통을 찾았습니다.`;
  return '아직 찾은 편지가 없습니다.';
}

function htmlResponse(statusCode, body, sessionId) {
  const headers = {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
  };

  if (sessionId) {
    headers['set-cookie'] = `${COOKIE_NAME}=${encodeURIComponent(sessionId)}; Max-Age=${MAX_AGE_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
  }

  return { statusCode, headers, body };
}

function renderPage({ message, foundCount = 0, maxCount = 3, displayCode, detail }) {
  const safeFoundCount = Math.max(0, Math.min(Number(foundCount || 0), maxCount));
  const progressPercent = Math.round((safeFoundCount / maxCount) * 100);
  const complete = safeFoundCount >= maxCount;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>&#50773;&#51032; &#50612;&#52272; &#52286;&#44592;</title>
  <style>
    :root {
      --glass: rgba(255, 255, 255, 0.12);
      --stroke: rgba(255, 255, 255, 0.28);
      --ink: #ffffff;
      --muted: rgba(255, 255, 255, 0.78);
      --accent-a: #ce93b3;
      --accent-b: #7db9e3;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: 'Noto Serif KR', 'Apple SD Gothic Neo', sans-serif;
      color: var(--ink);
      background: #0c2344 url('/images/yayeon-bg.jpg') center/cover fixed no-repeat;
      display: grid;
      place-items: center;
      padding: 1.2rem;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, rgba(20, 43, 85, 0.36), rgba(206, 147, 179, 0.18), rgba(125, 185, 227, 0.2));
      pointer-events: none;
    }
    .card {
      position: relative;
      width: min(100%, 430px);
      padding: 1.55rem;
      border: 1px solid var(--stroke);
      border-radius: 24px;
      background: var(--glass);
      box-shadow: 0 18px 54px rgba(16, 30, 61, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(10px) saturate(115%);
      -webkit-backdrop-filter: blur(10px) saturate(115%);
      text-align: center;
    }
    .eyebrow { margin: 0 0 0.5rem; font-size: 0.82rem; color: var(--muted); letter-spacing: 0.08em; }
    h1 { margin: 0; font-size: 1.55rem; line-height: 1.35; text-shadow: 0 3px 14px rgba(0,0,0,0.28); }
    .count { margin: 1.25rem auto 0.9rem; font-size: 4.3rem; font-weight: 800; line-height: 1; }
    .count small { font-size: 1.3rem; }
    .message { margin: 0.35rem 0 0; font-size: 1.15rem; font-weight: 700; }
    .detail { margin: 0.85rem 0 0; color: var(--muted); line-height: 1.55; font-size: 0.94rem; }
    .bar { margin: 1.25rem 0 1rem; height: 0.78rem; border-radius: 999px; background: rgba(255,255,255,0.16); overflow: hidden; }
    .bar span { display: block; height: 100%; width: ${progressPercent}%; border-radius: inherit; background: linear-gradient(90deg, var(--accent-a), var(--accent-b)); }
    .code { margin-top: 1rem; padding: 0.9rem; border-radius: 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18); }
    .code-label { font-size: 0.78rem; color: var(--muted); }
    .code-value { margin-top: 0.25rem; font-size: 1.45rem; font-weight: 800; letter-spacing: 0.12em; }
    .actions { display: grid; gap: 0.55rem; margin-top: 1.15rem; }
    a.button { display: block; text-decoration: none; color: #243b6b; font-weight: 800; padding: 0.86rem 1rem; border-radius: 999px; background: linear-gradient(90deg, #f2d8e7, #b7dff7); }
  </style>
</head>
<body>
  <main class="card">
    <h1>&#50773;&#51032; &#50612;&#52272; &#52286;&#44592;</h1>
    <div class="count">${safeFoundCount}<small>/${maxCount}</small></div>
    <p class="message">${message}</p>
    <div class="bar" aria-label="진행률"><span></span></div>
    <p class="detail">${detail || (complete ? '현장 스태프에게 이 화면을 보여주세요.' : '창경궁 곳곳에 숨겨진 다른 편지도 찾아보세요.')}</p>
    ${displayCode ? `<div class="code"><div class="code-label">확인 코드</div><div class="code-value">${displayCode}</div></div>` : ''}
    <div class="actions">
      <a class="button" href="/">&#50556;&#50672; &#47784;&#48148;&#51068;&#50937;&#51004;&#47196; &#46028;&#50500;&#44032;&#44592;</a>
    </div>
  </main>
</body>
</html>`;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return htmlResponse(405, renderPage({ message: '지원하지 않는 요청입니다.', detail: 'QR을 다시 스캔해 주세요.' }));
    }

    const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
    const existingSessionId = isUuid(cookies[COOKIE_NAME]) ? cookies[COOKIE_NAME] : null;
    const sessionId = existingSessionId || crypto.randomUUID();
    const token = getToken(event);

    let result;
    if (token) {
      result = await callRpc('scan_yayeon_letter', {
        p_public_token: token,
        p_session_id: sessionId,
        p_display_code: makeDisplayCode(),
      });
    } else if (existingSessionId) {
      result = await callRpc('get_yayeon_letter_progress', {
        p_session_id: existingSessionId,
      });
    } else {
      result = { ok: true, code: 'NO_SESSION', found_count: 0, max_count: 3, display_code: null };
    }

    if (!result || result.ok === false) {
      return htmlResponse(404, renderPage({
        message: '유효하지 않은 편지 QR입니다.',
        detail: 'QR 주소가 잘못되었거나 이벤트가 비활성화되었습니다.',
      }), existingSessionId || null);
    }

    const foundCount = Number(result.found_count || 0);
    const maxCount = Number(result.max_count || 3);
    return htmlResponse(200, renderPage({
      message: getProgressMessage(foundCount),
      foundCount,
      maxCount,
      displayCode: result.display_code,
    }), sessionId);
  } catch (error) {
    console.error('Letter QR event failed:', error);
    return htmlResponse(500, renderPage({
      message: '잠시 후 다시 시도해 주세요.',
      detail: '문제가 계속되면 현장 스태프에게 문의해 주세요.',
    }));
  }
};
