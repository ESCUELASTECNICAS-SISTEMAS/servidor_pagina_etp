const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { getIO } = require('../utils/socket');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not set in .env — tokens will not be signed securely');
}

const toOptionalPositiveInt = (v) => {
  if (typeof v === 'undefined' || v === null) return undefined;
  if (typeof v === 'string' && v.trim() === '') return undefined;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    if (user.active === false) return res.status(403).json({ message: 'user disabled' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'invalid credentials' });

    const payload = { id: user.id, email: user.email, role: user.role, sucursal_id: user.sucursal_id || null };
    const token = jwt.sign(payload, JWT_SECRET || 'dev-secret', { expiresIn: '24h' });

    // Register login event (non-blocking for response)
    try {
      if (user && user.id) {
        await db.LoginEvent.create({ user_id: user.id, sucursal_id: user.sucursal_id || null });
      }
    } catch (e) {
      console.error('failed to record login event', e);
    }

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, sucursal_id: user.sucursal_id || null } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.register = async (req, res) => {
  try {
    console.log('register body:', req.body);
    const body = req.body || {};
    const { name, email, password, role } = body;
    const sucursal_id = toOptionalPositiveInt(body.sucursal_id);
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    if (typeof body.sucursal_id !== 'undefined' && typeof sucursal_id === 'undefined') {
      return res.status(400).json({ message: 'sucursal_id must be a positive integer' });
    }

    if (typeof sucursal_id !== 'undefined') {
      const sucursal = await db.Sucursal.findByPk(sucursal_id);
      if (!sucursal || sucursal.active === false) {
        return res.status(400).json({ message: 'invalid sucursal_id' });
      }
    }

    const existing = await db.User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await db.User.create({ name: name || null, email, password_hash, role: role || 'cliente', sucursal_id: typeof sucursal_id === 'undefined' ? null : sucursal_id });

    try {
      const io = getIO();
      io.emit('nuevo_usuario', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sucursal_id: user.sucursal_id || null,
        created_at: user.created_at,
        active: user.active
      });
    } catch (e) {
      console.error('No se pudo emitir evento de nuevo usuario:', e.message);
    }

    const payload = { id: user.id, email: user.email, role: user.role, sucursal_id: user.sucursal_id || null };
    const token = jwt.sign(payload, JWT_SECRET || 'dev-secret', { expiresIn: '24h' });

    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, sucursal_id: user.sucursal_id || null } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
