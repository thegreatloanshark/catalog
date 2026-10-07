module.exports = function handler(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const real = req.headers['x-real-ip'];
  let ip = Array.isArray(forwarded) ? forwarded[0] : (forwarded || real || '');
  if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) ip = ip.slice(7);

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    ip: ip || 'Unavailable',
    timestamp: new Date().toISOString()
  });
};
