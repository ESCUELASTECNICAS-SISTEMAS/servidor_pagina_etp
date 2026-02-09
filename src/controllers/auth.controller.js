const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not set in .env — tokens will not be signed securely');
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    if (user.active === false) return res.status(403).json({ message: 'user disabled' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'invalid credentials' });

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const existing = await db.User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await db.User.create({ name: name || null, email, password_hash, role: role || 'cliente' });

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
