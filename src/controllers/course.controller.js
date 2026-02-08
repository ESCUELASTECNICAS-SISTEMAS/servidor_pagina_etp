const db = require('../models');

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (typeof req.query.published !== 'undefined') {
      const v = req.query.published.toString().toLowerCase();
      where.published = !(v === 'false' || v === '0');
    }
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      where.active = !(v === 'false' || v === '0');
    } else {
      where.active = true;
    }

    const courses = await db.Course.findAll({
      where,
      attributes: ['id','title','subtitle','type','slug','published','active','created_at'],
      include: [{ model: db.Media, as: 'thumbnail', attributes: ['id','url','alt_text'] }]
    });
    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const includeInactive = req.query.include_inactive && req.query.include_inactive.toString().toLowerCase() === 'true';
    const course = await db.Course.findByPk(id, {
      attributes: ['id','title','subtitle','description','type','slug','published','published_at','thumbnail_media_id','active','created_at'],
      include: [{ model: db.Media, as: 'thumbnail', attributes: ['id','url','alt_text'] }]
    });
    if (!course) return res.status(404).json({ message: 'not found' });
    if (course.active === false && !includeInactive) return res.status(404).json({ message: 'not found' });
    return res.json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, subtitle, description, type, thumbnail_media_id, slug, published } = req.body;
    if (!title || !type) return res.status(400).json({ message: 'title and type required' });
    const course = await db.Course.create({ title, subtitle, description, type, thumbnail_media_id, slug, published: !!published });
    return res.status(201).json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, type, thumbnail_media_id, slug, published, active } = req.body;
    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof title !== 'undefined') updates.title = title;
    if (typeof subtitle !== 'undefined') updates.subtitle = subtitle;
    if (typeof description !== 'undefined') updates.description = description;
    if (typeof type !== 'undefined') updates.type = type;
    if (typeof thumbnail_media_id !== 'undefined') updates.thumbnail_media_id = thumbnail_media_id;
    if (typeof slug !== 'undefined') updates.slug = slug;
    if (typeof published !== 'undefined') updates.published = !!published;
    if (typeof active !== 'undefined') updates.active = !!active;

    await course.update(updates);
    return res.json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'not found' });
    await course.update({ active: false });
    return res.json({ id: course.id, active: course.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
