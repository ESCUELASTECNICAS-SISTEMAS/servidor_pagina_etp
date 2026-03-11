const db = require('../models');
const geoip = (() => {
  try { return require('geoip-lite'); } catch (e) { return null; }
})();

exports.createVisit = async (req, res) => {
  try {
    const { path, course_id, sucursal_id, referrer } = req.body || {};

    // get ip (trusting proxy if set in env/server)
    let ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (!ip) ip = null;
    if (ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

    let country = null;
    if (geoip && ip) {
      try {
        const g = geoip.lookup(ip);
        if (g && g.country) country = g.country;
      } catch (e) { /* ignore geo errors */ }
    }

    const day = new Date().toISOString().slice(0,10); // YYYY-MM-DD
    const countryKey = country || '??';

    // Upsert increment
    const sql = `INSERT INTO visit_counts (day, country, count) VALUES ($1, $2, 1)
      ON CONFLICT (day, country) DO UPDATE SET count = visit_counts.count + 1`;
    await db.sequelize.query(sql, { bind: [day, countryKey] });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

// stats: totals and by-country for a date range (from/to YYYY-MM-DD). Defaults to today.
exports.stats = async (req, res) => {
  try {
    const qFrom = req.query.from;
    const qTo = req.query.to;
    const today = new Date().toISOString().slice(0,10);
    const from = (qFrom && typeof qFrom === 'string') ? qFrom : today;
    const to = (qTo && typeof qTo === 'string') ? qTo : from;

    const totalRes = await db.sequelize.query(
      'SELECT COALESCE(SUM(count),0)::bigint AS total FROM visit_counts WHERE day >= $1 AND day <= $2',
      { bind: [from, to], type: db.sequelize.QueryTypes.SELECT }
    );
    const total = (totalRes && totalRes[0] && totalRes[0].total) ? Number(totalRes[0].total) : 0;

    const byCountry = await db.sequelize.query(
      `SELECT country, COALESCE(SUM(count),0)::bigint AS count FROM visit_counts WHERE day >= $1 AND day <= $2 GROUP BY country ORDER BY count DESC`,
      { bind: [from, to], type: db.sequelize.QueryTypes.SELECT }
    );

    return res.json({ from, to, total, byCountry });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
