const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // load user to ensure still exists and is active
    const user = await db.User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'invalid token' });
    if (user.active === false) return res.status(403).json({ message: 'user disabled' });
    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch (err) {
    console.error('auth error', err);
    return res.status(401).json({ message: 'invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'not authenticated' });
  // accept english 'admin' and spanish 'administrador' (case-insensitive)
  const role = (req.user.role || '').toString().toLowerCase();
  if (!role.includes('admin')) return res.status(403).json({ message: 'admin required' });
  return next();
}

module.exports = { authenticate, requireAdmin };
