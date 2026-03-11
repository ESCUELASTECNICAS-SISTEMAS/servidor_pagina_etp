const db = require('../models');

const parseDate = (s, fallback) => {
  if (!s) return fallback;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString().slice(0,10);
};

exports.list = async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit || '50', 10));
    const offset = parseInt(req.query.offset || '0', 10);

    const rows = await db.LoginEvent.findAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre'] }
      ]
    });
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

// stats by sucursal and total for a date range (or today by default)
exports.stats = async (req, res) => {
  try {
    const from = parseDate(req.query.from, new Date().toISOString().slice(0,10));
    const toDay = parseDate(req.query.to, null) || from;
    // make to exclusive by adding one day
    const toDate = new Date(toDay + 'T00:00:00Z');
    toDate.setUTCDate(toDate.getUTCDate() + 1);

    const fromDateISO = from + 'T00:00:00Z';
    const toDateISO = toDate.toISOString();

    // total in range
    const totalRes = await db.sequelize.query(
      'SELECT COUNT(*)::int AS total FROM login_events WHERE created_at >= $1 AND created_at < $2',
      { bind: [fromDateISO, toDateISO], type: db.sequelize.QueryTypes.SELECT }
    );
    const total = totalRes && totalRes[0] ? totalRes[0].total : 0;

    // by sucursal
    const bySucursal = await db.sequelize.query(
      `SELECT COALESCE(le.sucursal_id,0) AS sucursal_id, COALESCE(s.nombre,'(sin sucursal)') AS nombre, COUNT(*)::int AS logins
       FROM login_events le
       LEFT JOIN sucursales s ON s.id = le.sucursal_id
       WHERE le.created_at >= $1 AND le.created_at < $2
       GROUP BY le.sucursal_id, s.nombre
       ORDER BY logins DESC`,
      { bind: [fromDateISO, toDateISO], type: db.sequelize.QueryTypes.SELECT }
    );

    return res.json({ from, to: toDay, total, bySucursal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
