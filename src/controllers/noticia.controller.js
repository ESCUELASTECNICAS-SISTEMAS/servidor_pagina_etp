const db = require('../models');
const mailer = require('../utils/mailer');

exports.list = async (req, res) => {
  try {
    // By default return all items. Apply filters only if query params provided.
    const where = {};
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      where.active = !(v === 'false' || v === '0');
    }
    if (typeof req.query.published !== 'undefined') {
      const v = req.query.published.toString().toLowerCase();
      where.published = !(v === 'false' || v === '0');
    }

    const items = await db.Noticia.findAll({ where, attributes: ['id', 'title', 'summary', 'featured_media_id', 'published', 'published_at', 'author', 'slug', 'category', 'tags', 'active', 'created_at'] });
    // Ordenar por fecha de publicación descendente, luego por creación descendente
    items.sort((a, b) => {
      // Si ambos tienen published_at, ordenar por published_at
      if (a.published_at && b.published_at) {
        return new Date(b.published_at) - new Date(a.published_at);
      }
      // Si solo uno tiene published_at, ese va primero
      if (a.published_at) return -1;
      if (b.published_at) return 1;
      // Si ninguno tiene published_at, ordenar por created_at
      return new Date(b.created_at) - new Date(a.created_at);
    });

    // Formatear y estructurar el JSON de salida
    const formatted = items.map(n => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      featured_media_id: n.featured_media_id || null,
      published: n.published,
      published_at: n.published_at ? new Date(n.published_at).toISOString() : null,
      author: n.author,
      slug: n.slug,
      category: n.category,
      tags: n.tags,
      active: n.active,
      created_at: n.created_at ? new Date(n.created_at).toISOString() : null
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
    const item = await db.Noticia.findByPk(id, { attributes: ['id', 'title', 'summary', 'featured_media_id', 'published', 'published_at', 'author', 'slug', 'category', 'tags', 'active', 'created_at'] });
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
// Obtener noticia por slug
exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await db.Noticia.findOne({
      where: { slug },
      attributes: ['id', 'title', 'summary', 'featured_media_id', 'published', 'published_at', 'author', 'slug', 'category', 'tags', 'active', 'created_at']
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
    const { title, summary, featured_media_id, published, published_at, author, slug, category, tags } = req.body;
    if (!title) return res.status(400).json({ message: 'title required' });

    const item = await db.Noticia.create({ title, summary, featured_media_id, published: !!published, published_at, author, slug, category, tags });
    try {
      if (item.published) {
        const users = await db.User.findAll({ where: { active: true }, attributes: ['email'] });
        const emails = users.map(u => u.email).filter(Boolean);
        if (emails.length) await mailer.sendNewsNotification(emails, item);
      }
    } catch (mailErr) {
      console.error('failed to send publication emails', mailErr);
    }
    return res.status(201).json({
      id: item.id,
      title: item.title,
      summary: item.summary,
      featured_media_id: item.featured_media_id,
      published: item.published,
      published_at: item.published_at,
      author: item.author,
      slug: item.slug,
      category: item.category,
      tags: item.tags,
      active: item.active
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, featured_media_id, published, published_at, author, slug, category, tags, active } = req.body;
    const item = await db.Noticia.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });
    const oldPublished = item.published;

    const updates = {};
    if (typeof title !== 'undefined') updates.title = title;
    if (typeof summary !== 'undefined') updates.summary = summary;
    if (typeof featured_media_id !== 'undefined') updates.featured_media_id = featured_media_id;
    if (typeof published !== 'undefined') updates.published = !!published;
    if (typeof published_at !== 'undefined') updates.published_at = published_at;
    if (typeof author !== 'undefined') updates.author = author;
    if (typeof slug !== 'undefined') updates.slug = slug;
    if (typeof category !== 'undefined') updates.category = category;
    if (typeof tags !== 'undefined') updates.tags = tags;
    if (typeof active !== 'undefined') updates.active = !!active;

    await item.update(updates);
    try {
      if (typeof updates.published !== 'undefined' && updates.published === true && !oldPublished) {
        const users = await db.User.findAll({ where: { active: true }, attributes: ['email'] });
        const emails = users.map(u => u.email).filter(Boolean);
        if (emails.length) await mailer.sendNewsNotification(emails, item);
      }
    } catch (mailErr) {
      console.error('failed to send publication emails', mailErr);
    }
    return res.json({
      id: item.id,
      title: item.title,
      summary: item.summary,
      featured_media_id: item.featured_media_id,
      published: item.published,
      published_at: item.published_at,
      author: item.author,
      slug: item.slug,
      category: item.category,
      tags: item.tags,
      active: item.active
    });
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
