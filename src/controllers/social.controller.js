const db = require('../models');

const toPositiveInt = (v) => {
  if (typeof v === 'undefined' || v === null) return undefined;
  if (typeof v === 'string' && v.trim() === '') return undefined;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
};

exports.list = async (req, res) => {
  try {
    let activeFilter = true;
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      activeFilter = !(v === 'false' || v === '0');
    }

    const sucursalId = toPositiveInt(req.query.sucursal_id);
    if (typeof req.query.sucursal_id !== 'undefined' && typeof sucursalId === 'undefined') {
      return res.status(400).json({ message: 'sucursal_id must be a positive integer' });
    }

    const where = { active: activeFilter };
    if (typeof sucursalId !== 'undefined') where.sucursal_id = sucursalId;

    const items = await db.SocialLink.findAll({
      where,
      attributes: ['id', 'network', 'value', 'active'],
      include: [{ model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre', 'ciudad', 'direccion', 'telefono', 'email', 'active'] }]
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
    const item = await db.SocialLink.findByPk(id, { attributes: ['id', 'network', 'value', 'active'], include: [{ model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre', 'ciudad', 'direccion', 'telefono', 'email', 'active'] }] });
    if (!item) return res.status(404).json({ message: 'not found' });

    const sucursalId = toPositiveInt(req.query.sucursal_id);
    if (typeof req.query.sucursal_id !== 'undefined' && typeof sucursalId === 'undefined') {
      return res.status(400).json({ message: 'sucursal_id must be a positive integer' });
    }
    if (typeof sucursalId !== 'undefined' && item.sucursal_id !== sucursalId) {
      return res.status(404).json({ message: 'not found' });
    }

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
    const { network, value } = req.body;
    const sucursal_id = toPositiveInt(req.body.sucursal_id);
    if (!network || !value || typeof sucursal_id === 'undefined') {
      return res.status(400).json({ message: 'network, value and sucursal_id required' });
    }

    const sucursal = await db.Sucursal.findByPk(sucursal_id);
    if (!sucursal || sucursal.active === false) {
      return res.status(400).json({ message: 'invalid sucursal_id' });
    }

    const item = await db.SocialLink.create({ network, value, sucursal_id });
    return res.status(201).json({ id: item.id, network: item.network, value: item.value, sucursal_id: item.sucursal_id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { network, value, active } = req.body;
    const hasSucursalInput = Object.prototype.hasOwnProperty.call(req.body, 'sucursal_id');
    const sucursal_id = toPositiveInt(req.body.sucursal_id);
    const item = await db.SocialLink.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    if (hasSucursalInput && typeof sucursal_id === 'undefined') {
      return res.status(400).json({ message: 'sucursal_id must be a positive integer' });
    }

    if (hasSucursalInput) {
      const sucursal = await db.Sucursal.findByPk(sucursal_id);
      if (!sucursal || sucursal.active === false) {
        return res.status(400).json({ message: 'invalid sucursal_id' });
      }
    }

    const updates = {};
    if (typeof network !== 'undefined') updates.network = network;
    if (typeof value !== 'undefined') updates.value = value;
    if (typeof active !== 'undefined') updates.active = !!active;
    if (hasSucursalInput) updates.sucursal_id = sucursal_id;

    await item.update(updates);
    return res.json({ id: item.id, network: item.network, value: item.value, sucursal_id: item.sucursal_id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.SocialLink.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    // soft-delete: set active=false
    await item.update({ active: false });
    return res.json({ id: item.id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
