const db = require('../models');

exports.list = async (req, res) => {
  try {
    let activeFilter = true;
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      activeFilter = !(v === 'false' || v === '0');
    }

    const where = { active: activeFilter };
    const items = await db.Modalidad.findAll({
      where,
      attributes: ['id', 'nombre', 'descripcion', 'active', 'created_at'],
      order: [['nombre', 'ASC']]
    });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Modalidad.findByPk(id, { attributes: ['id', 'nombre', 'descripcion', 'active', 'created_at'] });
    if (!item) return res.status(404).json({ message: 'not found' });
    if (item.active === false && !(req.query.include_inactive && req.query.include_inactive === 'true')) {
      return res.status(404).json({ message: 'not found' });
    }
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'nombre required' });

    const item = await db.Modalidad.create({ nombre, descripcion });
    return res.status(201).json({
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      active: item.active,
      created_at: item.created_at
    });
  } catch (err) {
    console.error(err);
    if (err && err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'nombre already in use' });
    }
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, active } = req.body;
    const item = await db.Modalidad.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof nombre !== 'undefined') updates.nombre = nombre;
    if (typeof descripcion !== 'undefined') updates.descripcion = descripcion;
    if (typeof active !== 'undefined') updates.active = !!active;

    await item.update(updates);
    return res.json({
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      active: item.active,
      created_at: item.created_at
    });
  } catch (err) {
    console.error(err);
    if (err && err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'nombre already in use' });
    }
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Modalidad.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    await item.update({ active: false });
    return res.json({ id: item.id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
