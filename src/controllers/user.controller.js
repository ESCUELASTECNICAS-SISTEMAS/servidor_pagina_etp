const db = require('../models');
const bcrypt = require('bcrypt');

exports.list = async (req, res) => {
  try {
    // query param: ?active=true|false  (default: true)
    let activeFilter = true;
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      if (v === 'false' || v === '0') activeFilter = false;
      else activeFilter = true;
    }

    const where = { active: activeFilter };

    const users = await db.User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'created_at', 'active']
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};


exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'created_at', 'active']
    });
    if (!user) return res.status(404).json({ message: 'user not found' });

    // include inactive only if ?include_inactive=true
    const includeInactive = req.query.include_inactive && req.query.include_inactive.toString().toLowerCase() === 'true';
    if (user.active === false && !includeInactive) return res.status(404).json({ message: 'user not found' });

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const existing = await db.User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await db.User.create({ name, email, password_hash, role });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at, active: user.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'user not found' });

    if (email && email !== user.email) {
      const other = await db.User.findOne({ where: { email } });
      if (other) return res.status(409).json({ message: 'email already in use' });
    }

    const updates = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof email !== 'undefined') updates.email = email;
    if (typeof role !== 'undefined') updates.role = role;
    if (password) updates.password_hash = await bcrypt.hash(password, 10);

    await user.update(updates);
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at, active: user.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.setActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (typeof active === 'undefined') return res.status(400).json({ message: 'active field required' });

    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'user not found' });

    await user.update({ active: !!active });
    return res.json({ id: user.id, active: user.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
