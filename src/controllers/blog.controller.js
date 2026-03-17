const db = require('../models');
const slugify = require('slugify');
const mailer = require('../utils/mailer');

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.author_id) where.author_id = req.query.author_id;

    const items = await db.Blog.findAll({
      where,
      attributes: ['id','title','slug','summary','status','published_at','views','created_at','updated_at'],
      include: [
        { model: db.Media, as: 'featured_media', attributes: ['id','url','alt_text','title','thumbnail_url'] },
        { model: db.User, as: 'author', attributes: ['id','name','email'] }
      ]
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
    const item = await db.Blog.findByPk(id, {
      include: [
        { model: db.Media, as: 'featured_media', attributes: ['id','url','alt_text','title','thumbnail_url'] },
        { model: db.User, as: 'author', attributes: ['id','name','email'] },
        { model: db.Media, as: 'media', through: { attributes: ['position','caption'] }, attributes: ['id','url','type','title','thumbnail_url'] }
      ]
    });
    if (!item) return res.status(404).json({ message: 'not found' });
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

async function ensureMediaRecords(mediaArray = []) {
  const result = [];
  for (const m of mediaArray) {
    if (!m) continue;
    if (m.id) {
      const existing = await db.Media.findByPk(m.id);
      if (existing) { result.push({ instance: existing, caption: m.caption, position: m.position }); continue; }
    }
    if (!m.url) continue;
    const created = await db.Media.create({ url: m.url, title: m.title || null, category: m.type || null, active: true, is_external: true, type: m.type || null, thumbnail_url: m.thumbnail_url || null });
    result.push({ instance: created, caption: m.caption, position: m.position });
  }
  return result;
}

exports.create = async (req, res) => {
  try {
    const { title, slug, summary, content, author_id, status, published_at, featured_media_urls, tags, allow_comments, meta_title, meta_description, canonical_url, media } = req.body;
    if (!title) return res.status(400).json({ message: 'title required' });

    // Validar featured_media_urls
    let urls = null;
    if (Array.isArray(featured_media_urls)) {
      if (featured_media_urls.length > 3) return res.status(400).json({ message: 'Máximo 3 imágenes permitidas en featured_media_urls' });
      urls = featured_media_urls;
    }

    const finalSlug = slug || slugify(title, { lower: true, strict: true });
    const item = await db.Blog.create({ title, slug: finalSlug, summary, content, author_id: author_id || null, status: status || 'draft', published_at: published_at || null, featured_media_urls: urls, tags: tags || null, allow_comments: !!allow_comments, meta_title: meta_title || null, meta_description: meta_description || null, canonical_url: canonical_url || null });

    if (Array.isArray(media) && media.length) {
      const mediaRecords = await ensureMediaRecords(media);
      for (const m of mediaRecords) {
        await item.addMedia(m.instance, { through: { position: m.position || null, caption: m.caption || null } });
      }
    }

    try {
      if (item.status === 'published') {
        const users = await db.User.findAll({ where: { active: true }, attributes: ['email'] });
        const emails = users.map(u => u.email).filter(Boolean);
        if (emails.length) await mailer.sendNewsNotification(emails, item);
      }
    } catch (mailErr) {
      console.error('failed to send publication emails', mailErr);
    }

    return res.status(201).json({ id: item.id, title: item.title, slug: item.slug, status: item.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, summary, content, author_id, status, published_at, featured_media_urls, tags, allow_comments, meta_title, meta_description, canonical_url, media } = req.body;
    const item = await db.Blog.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });
    const oldStatus = item.status;

    const updates = {};
    if (typeof title !== 'undefined') updates.title = title;
    if (typeof slug !== 'undefined') updates.slug = slug;
    if (typeof summary !== 'undefined') updates.summary = summary;
    if (typeof content !== 'undefined') updates.content = content;
    if (typeof author_id !== 'undefined') updates.author_id = author_id;
    if (typeof status !== 'undefined') updates.status = status;
    if (typeof published_at !== 'undefined') updates.published_at = published_at;
    if (typeof featured_media_urls !== 'undefined') {
      if (Array.isArray(featured_media_urls) && featured_media_urls.length > 3) {
        return res.status(400).json({ message: 'Máximo 3 imágenes permitidas en featured_media_urls' });
      }
      updates.featured_media_urls = featured_media_urls;
    }
    if (typeof tags !== 'undefined') updates.tags = tags;
    if (typeof allow_comments !== 'undefined') updates.allow_comments = !!allow_comments;
    if (typeof meta_title !== 'undefined') updates.meta_title = meta_title;
    if (typeof meta_description !== 'undefined') updates.meta_description = meta_description;
    if (typeof canonical_url !== 'undefined') updates.canonical_url = canonical_url;

    await item.update(updates);

    if (Array.isArray(media)) {
      // remove existing associations then add provided ones in order
      await item.setMedia([]);
      const mediaRecords = await ensureMediaRecords(media);
      for (const m of mediaRecords) { 
        await item.addMedia(m.instance, { through: { position: m.position || null, caption: m.caption || null } });
      }
    }

    try {
      if (typeof updates.status !== 'undefined' && updates.status === 'published' && oldStatus !== 'published') {
        const users = await db.User.findAll({ where: { active: true }, attributes: ['email'] });
        const emails = users.map(u => u.email).filter(Boolean);
        if (emails.length) await mailer.sendNewsNotification(emails, item);
      }
    } catch (mailErr) {
      console.error('failed to send publication emails', mailErr);
    }

    return res.json({ id: item.id, title: item.title, slug: item.slug, status: item.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.Blog.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    await item.update({ status: 'archived' });
    return res.json({ id: item.id, status: item.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
