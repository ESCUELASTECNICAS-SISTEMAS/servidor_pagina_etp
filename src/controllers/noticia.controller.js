const db = require('../models');

exports.list = async (req, res) => {
  try {
    let activeFilter = true;
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      activeFilter = !(v === 'false' || v === '0');
    }

    const where = { active: activeFilter };
    const items = await db.Noticia.findAll({ where, attributes: ['id', 'title', 'summary', 'featured_media_id', 'published', 'published_at', 'active', 'created_at'] });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Noticia.findByPk(id, { attributes: ['id', 'title', 'summary', 'featured_media_id', 'published', 'published_at', 'active', 'created_at'] });
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
    const { title, summary, featured_media_id, published, published_at } = req.body;
    if (!title) return res.status(400).json({ message: 'title required' });

    const item = await db.Noticia.create({ title, summary, featured_media_id, published: !!published, published_at });
    return res.status(201).json({ id: item.id, title: item.title, summary: item.summary, featured_media_id: item.featured_media_id, published: item.published, published_at: item.published_at, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, featured_media_id, published, published_at, active } = req.body;
    const item = await db.Noticia.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof title !== 'undefined') updates.title = title;
    if (typeof summary !== 'undefined') updates.summary = summary;
    if (typeof featured_media_id !== 'undefined') updates.featured_media_id = featured_media_id;
    if (typeof published !== 'undefined') updates.published = !!published;
    if (typeof published_at !== 'undefined') updates.published_at = published_at;
    if (typeof active !== 'undefined') updates.active = !!active;

    await item.update(updates);
    return res.json({ id: item.id, title: item.title, summary: item.summary, featured_media_id: item.featured_media_id, published: item.published, published_at: item.published_at, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Noticia.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    await item.update({ active: false });
    return res.json({ id: item.id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
