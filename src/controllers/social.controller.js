const db = require('../models');

exports.list = async (req, res) => {
  try {
    let activeFilter = true;
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      activeFilter = !(v === 'false' || v === '0');
    }

    const where = { active: activeFilter };
    const items = await db.SocialLink.findAll({ where, attributes: ['id', 'network', 'value', 'active'] });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.SocialLink.findByPk(id, { attributes: ['id', 'network', 'value', 'active'] });
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
    const { network, value } = req.body;
    if (!network || !value) return res.status(400).json({ message: 'network and value required' });

    const item = await db.SocialLink.create({ network, value });
    return res.status(201).json({ id: item.id, network: item.network, value: item.value, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { network, value, active } = req.body;
    const item = await db.SocialLink.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof network !== 'undefined') updates.network = network;
    if (typeof value !== 'undefined') updates.value = value;
    if (typeof active !== 'undefined') updates.active = !!active;

    await item.update(updates);
    return res.json({ id: item.id, network: item.network, value: item.value, active: item.active });
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
