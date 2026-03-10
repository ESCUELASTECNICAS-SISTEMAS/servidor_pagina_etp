const db = require('../models');
const bcrypt = require('bcrypt');

const toOptionalPositiveInt = (v) => {
  if (typeof v === 'undefined' || v === null) return undefined;
  if (typeof v === 'string' && v.trim() === '') return undefined;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
};

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
    // sorting: allow ?sort=name|created_at|email|role|id and ?dir=asc|desc
    const allowedSort = ['name', 'created_at', 'email', 'role', 'id'];
    const sort = allowedSort.includes(req.query.sort) ? req.query.sort : 'name';
    const dir = (req.query.dir && req.query.dir.toString().toLowerCase() === 'desc') ? 'DESC' : 'ASC';

    const users = await db.User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'sucursal_id', 'created_at', 'active'],
      order: [[sort, dir]]
    });

    // format created_at as ISO string for consistent output
    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      sucursal_id: u.sucursal_id || null,
      created_at: u.created_at ? u.created_at.toISOString() : null,
      active: u.active
    }));
    return res.json(formatted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};


exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'sucursal_id', 'created_at', 'active']
    });
    if (!user) return res.status(404).json({ message: 'user not found' });

    // include inactive only if ?include_inactive=true
    const includeInactive = req.query.include_inactive && req.query.include_inactive.toString().toLowerCase() === 'true';
    if (user.active === false && !includeInactive) return res.status(404).json({ message: 'user not found' });
    const formatted = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sucursal_id: user.sucursal_id || null,
      created_at: user.created_at ? user.created_at.toISOString() : null,
      active: user.active
    };
    return res.json(formatted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const sucursal_id = toOptionalPositiveInt(req.body.sucursal_id);
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    if (typeof req.body.sucursal_id !== 'undefined' && typeof sucursal_id === 'undefined') {
      return res.status(400).json({ message: 'sucursal_id must be a positive integer' });
    }

    if (typeof sucursal_id !== 'undefined') {
      const sucursal = await db.Sucursal.findByPk(sucursal_id);
      if (!sucursal || sucursal.active === false) return res.status(400).json({ message: 'invalid sucursal_id' });
    }

    const existing = await db.User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await db.User.create({ name, email, password_hash, role, sucursal_id: typeof sucursal_id === 'undefined' ? null : sucursal_id });
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, sucursal_id: user.sucursal_id || null, created_at: user.created_at, active: user.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const hasSucursalInput = Object.prototype.hasOwnProperty.call(req.body, 'sucursal_id');
    const sucursal_id = toOptionalPositiveInt(req.body.sucursal_id);
    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'user not found' });

    if (
      hasSucursalInput &&
      req.body.sucursal_id !== null &&
      !(typeof req.body.sucursal_id === 'string' && req.body.sucursal_id.trim() === '') &&
      typeof sucursal_id === 'undefined'
    ) {
      return res.status(400).json({ message: 'sucursal_id must be a positive integer' });
    }

    if (hasSucursalInput && typeof sucursal_id !== 'undefined') {
      const sucursal = await db.Sucursal.findByPk(sucursal_id);
      if (!sucursal || sucursal.active === false) return res.status(400).json({ message: 'invalid sucursal_id' });
    }

    if (email && email !== user.email) {
      const other = await db.User.findOne({ where: { email } });
      if (other) return res.status(409).json({ message: 'email already in use' });
    }

    const updates = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof email !== 'undefined') updates.email = email;
    if (typeof role !== 'undefined') updates.role = role;
    if (hasSucursalInput) {
      if (req.body.sucursal_id === null || (typeof req.body.sucursal_id === 'string' && req.body.sucursal_id.trim() === '')) {
        updates.sucursal_id = null;
      } else {
        updates.sucursal_id = sucursal_id;
      }
    }
    if (password) updates.password_hash = await bcrypt.hash(password, 10);

    await user.update(updates);
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, sucursal_id: user.sucursal_id || null, created_at: user.created_at, active: user.active });
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
