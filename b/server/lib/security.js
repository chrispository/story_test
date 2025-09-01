export function requireAdmin(req, res, next) {
  const hdr = req.headers['authorization'] || '';
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASS || 'change-me';
  if (!hdr.startsWith('Basic ')) return unauthorized(res);
  const b64 = hdr.slice(6);
  let decoded = '';
  try { decoded = Buffer.from(b64, 'base64').toString('utf8'); } catch { return unauthorized(res); }
  const idx = decoded.indexOf(':');
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  if (user === expectedUser && pass === expectedPass) return next();
  return unauthorized(res);
}

function unauthorized(res) {
  res.set('WWW-Authenticate', 'Basic realm="Admin", charset="UTF-8"');
  return res.status(401).send('Authentication required');
}

