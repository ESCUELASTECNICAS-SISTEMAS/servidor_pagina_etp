const db = require('../models');

exports.list = async (req, res) => {
  try {
    // If ?active=true|false is provided, filter by active flag; otherwise return all slides.
    let where = {};
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      const activeFilter = !(v === 'false' || v === '0');
      where = { active: activeFilter };
    }

    const items = await db.CarouselSlide.findAll({ where, include: [{ model: db.Media, as: 'media', attributes: ['id','url','alt_text'] }], attributes: ['id','media_id','title','order_index','active'], order: [['order_index','ASC']] });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.CarouselSlide.findByPk(id, { include: [{ model: db.Media, as: 'media', attributes: ['id','url','alt_text'] }], attributes: ['id','media_id','title','order_index','active'] });
    if (!item) return res.status(404).json({ message: 'not found' });
    if (item.active === false && !(req.query.include_inactive && req.query.include_inactive === 'true')) return res.status(404).json({ message: 'not found' });
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { media_id, title, order_index } = req.body;
    if (!media_id) return res.status(400).json({ message: 'media_id required' });
    const item = await db.CarouselSlide.create({ media_id, title, order_index: order_index || 0 });
    return res.status(201).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { media_id, title, order_index, active } = req.body;
    const item = await db.CarouselSlide.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });
    const updates = {};
    if (typeof media_id !== 'undefined') updates.media_id = media_id;
    if (typeof title !== 'undefined') updates.title = title;
    if (typeof order_index !== 'undefined') updates.order_index = order_index;
    if (typeof active !== 'undefined') updates.active = !!active;
    await item.update(updates);
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.CarouselSlide.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });
    await item.update({ active: false });
    return res.json({ id: item.id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
