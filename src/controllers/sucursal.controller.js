const db = require('../models');

exports.list = async (req, res) => {
  try {
    let activeFilter = true;
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      activeFilter = !(v === 'false' || v === '0');
    }

    const where = { active: activeFilter };
    const items = await db.Sucursal.findAll({
      where,
      attributes: ['id', 'nombre', 'ciudad', 'direccion', 'telefono', 'email', 'active', 'created_at'],
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
    const item = await db.Sucursal.findByPk(id, {
      attributes: ['id', 'nombre', 'ciudad', 'direccion', 'telefono', 'email', 'active', 'created_at']
    });
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
    const { nombre, ciudad, direccion, telefono, email } = req.body;
    if (!nombre || !ciudad) return res.status(400).json({ message: 'nombre and ciudad required' });

    const item = await db.Sucursal.create({ nombre, ciudad, direccion, telefono, email });
    return res.status(201).json({
      id: item.id,
      nombre: item.nombre,
      ciudad: item.ciudad,
      direccion: item.direccion,
      telefono: item.telefono,
      email: item.email,
      active: item.active,
      created_at: item.created_at
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ciudad, direccion, telefono, email, active } = req.body;
    const item = await db.Sucursal.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof nombre !== 'undefined') updates.nombre = nombre;
    if (typeof ciudad !== 'undefined') updates.ciudad = ciudad;
    if (typeof direccion !== 'undefined') updates.direccion = direccion;
    if (typeof telefono !== 'undefined') updates.telefono = telefono;
    if (typeof email !== 'undefined') updates.email = email;
    if (typeof active !== 'undefined') updates.active = !!active;

    await item.update(updates);
    return res.json({
      id: item.id,
      nombre: item.nombre,
      ciudad: item.ciudad,
      direccion: item.direccion,
      telefono: item.telefono,
      email: item.email,
      active: item.active,
      created_at: item.created_at
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Sucursal.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    await item.update({ active: false });
    return res.json({ id: item.id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
