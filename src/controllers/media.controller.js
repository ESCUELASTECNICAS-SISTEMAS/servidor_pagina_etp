const db = require('../models');

exports.list = async (req, res) => {
  try {
    let activeFilter = true;
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      activeFilter = !(v === 'false' || v === '0');
    }

    const where = { active: activeFilter };
    const items = await db.Media.findAll({ where, attributes: ['id','url','alt_text','provider','remote_id','mime_type','width','height','active','created_at'] });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Media.findByPk(id, { attributes: ['id','url','alt_text','provider','remote_id','mime_type','width','height','active','created_at'] });
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
    const { url, alt_text, provider, remote_id, mime_type, width, height } = req.body;
    if (!url) return res.status(400).json({ message: 'url required' });

    const item = await db.Media.create({ url, alt_text, provider, remote_id, mime_type, width, height });
    return res.status(201).json({ id: item.id, url: item.url, alt_text: item.alt_text, provider: item.provider, remote_id: item.remote_id, mime_type: item.mime_type, width: item.width, height: item.height, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, alt_text, provider, remote_id, mime_type, width, height, active } = req.body;
    const item = await db.Media.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof url !== 'undefined') updates.url = url;
    if (typeof alt_text !== 'undefined') updates.alt_text = alt_text;
    if (typeof provider !== 'undefined') updates.provider = provider;
    if (typeof remote_id !== 'undefined') updates.remote_id = remote_id;
    if (typeof mime_type !== 'undefined') updates.mime_type = mime_type;
    if (typeof width !== 'undefined') updates.width = width;
    if (typeof height !== 'undefined') updates.height = height;
    if (typeof active !== 'undefined') updates.active = !!active;

    await item.update(updates);
    return res.json({ id: item.id, url: item.url, alt_text: item.alt_text, provider: item.provider, remote_id: item.remote_id, mime_type: item.mime_type, width: item.width, height: item.height, active: item.active });
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
