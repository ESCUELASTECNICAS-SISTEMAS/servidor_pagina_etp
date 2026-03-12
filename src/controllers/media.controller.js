const db = require('../models');

exports.list = async (req, res) => {
  try {
    // Return media, optionally filtered by category and active state.
    const attrs = ['id','url','alt_text','category','active','created_at'];
    const where = {};
    if (typeof req.query.category !== 'undefined') where.category = req.query.category;
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      where.active = !(v === 'false' || v === '0');
    }
    const items = await db.Media.findAll({ where, attributes: attrs, order: [['created_at','DESC']] });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Media.findByPk(id, { attributes: ['id','url','alt_text','category','active','created_at'] });
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
    const { url, alt_text, category, provider, remote_id, mime_type, width, height } = req.body;
    if (!url) return res.status(400).json({ message: 'url required' });

    const payload = { url, alt_text };
    if (typeof category !== 'undefined') payload.category = category;

    const item = await db.Media.create(payload);
    return res.status(201).json({ id: item.id, url: item.url, alt_text: item.alt_text, category: item.category, active: item.active, created_at: item.created_at });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, alt_text, category, active } = req.body;
    const item = await db.Media.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof url !== 'undefined') updates.url = url;
    if (typeof alt_text !== 'undefined') updates.alt_text = alt_text;
    if (typeof category !== 'undefined') updates.category = category;
    if (typeof active !== 'undefined') updates.active = !!active;

    await item.update(updates);
    return res.json({ id: item.id, url: item.url, alt_text: item.alt_text, category: item.category, active: item.active, created_at: item.created_at });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Media.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    // soft-delete
    await item.update({ active: false });
    return res.json({ id: item.id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
