const db = require('../models');
const slugify = require('slugify');

exports.list = async (req, res) => {
  const where = {};
  if (req.query.category) where.category = req.query.category;
  if (req.query.active !== undefined) where.active = req.query.active === 'true' || req.query.active === '1';
  const items = await db.Tip.findAll({ where, order: [['created_at','DESC']] });
  return res.json(items);
};

exports.getById = async (req, res) => {
  const item = await db.Tip.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'not found' });
  return res.json(item);
};

exports.getBySlug = async (req, res) => {
  const item = await db.Tip.findOne({ where: { slug: req.params.slug } });
  if (!item) return res.status(404).json({ message: 'not found' });
  return res.json(item);
};

exports.create = async (req, res) => {
  const { title, slug, description, image_url, alt_text, category, meta_title, meta_description, tags, active } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });

  let finalSlug = slug && slug.length ? slug : slugify(title, { lower: true, strict: true });
  // ensure uniqueness
  let exists = await db.Tip.findOne({ where: { slug: finalSlug } });
  let suffix = 1;
  while (exists) {
    finalSlug = `${finalSlug}-${suffix++}`;
    exists = await db.Tip.findOne({ where: { slug: finalSlug } });
  }

  const payload = { title, slug: finalSlug, description, image_url, alt_text, category, meta_title, meta_description, tags, active };
  const item = await db.Tip.create(payload);
  return res.status(201).json(item);
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { title, slug, description, image_url, alt_text, category, meta_title, meta_description, tags, active } = req.body;
  const item = await db.Tip.findByPk(id);
  if (!item) return res.status(404).json({ message: 'not found' });

  const updates = {};
  if (typeof title !== 'undefined') updates.title = title;
  if (typeof description !== 'undefined') updates.description = description;
  if (typeof image_url !== 'undefined') updates.image_url = image_url;
  if (typeof alt_text !== 'undefined') updates.alt_text = alt_text;
  if (typeof category !== 'undefined') updates.category = category;
  if (typeof meta_title !== 'undefined') updates.meta_title = meta_title;
  if (typeof meta_description !== 'undefined') updates.meta_description = meta_description;
  if (typeof tags !== 'undefined') updates.tags = tags;
  if (typeof active !== 'undefined') updates.active = active;

  // handle slug change
  if (typeof slug !== 'undefined' && slug.length) {
    let finalSlug = slugify(slug, { lower: true, strict: true });
    let exists = await db.Tip.findOne({ where: { slug: finalSlug, id: { [db.Sequelize.Op.ne]: id } } });
    let suffix = 1;
    while (exists) {
      finalSlug = `${finalSlug}-${suffix++}`;
      exists = await db.Tip.findOne({ where: { slug: finalSlug, id: { [db.Sequelize.Op.ne]: id } } });
    }
    updates.slug = finalSlug;
  }

  await db.Tip.update(updates, { where: { id } });
  const updated = await db.Tip.findByPk(id);
  return res.json(updated);
};

exports.remove = async (req, res) => {
  const id = req.params.id;
  const item = await db.Tip.findByPk(id);
  if (!item) return res.status(404).json({ message: 'not found' });
  await db.Tip.destroy({ where: { id } });
  return res.json({ ok: true });
};
