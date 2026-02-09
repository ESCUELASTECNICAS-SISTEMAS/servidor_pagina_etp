const db = require('../models');

exports.list = async (req, res) => {
  try {
    const where = {};
    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      where.active = !(v === 'false' || v === '0');
    } else {
      where.active = true;
    }

    const docentes = await db.Docente.findAll({
      where,
      attributes: ['id', 'nombre', 'especialidad', 'bio', 'email', 'foto_media_id', 'active', 'created_at'],
      include: [{ model: db.Media, as: 'foto', attributes: ['id', 'url', 'alt_text'] }]
    });
    return res.json(docentes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const includeInactive = req.query.include_inactive && req.query.include_inactive.toString().toLowerCase() === 'true';

    const docente = await db.Docente.findByPk(id, {
      attributes: ['id', 'nombre', 'especialidad', 'bio', 'email', 'foto_media_id', 'active', 'created_at'],
      include: [
        { model: db.Media, as: 'foto', attributes: ['id', 'url', 'alt_text'] },
        { model: db.Course, as: 'courses', attributes: ['id', 'title', 'type', 'slug'], through: { attributes: ['rol'] } }
      ]
    });
    if (!docente) return res.status(404).json({ message: 'not found' });
    if (docente.active === false && !includeInactive) return res.status(404).json({ message: 'not found' });

    return res.json(docente);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, especialidad, bio, email, foto_media_id } = req.body;
    if (!nombre) return res.status(400).json({ message: 'nombre required' });

    const docente = await db.Docente.create({ nombre, especialidad, bio, email, foto_media_id });
    return res.status(201).json(docente);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, especialidad, bio, email, foto_media_id, active } = req.body;

    const docente = await db.Docente.findByPk(id);
    if (!docente) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof nombre !== 'undefined') updates.nombre = nombre;
    if (typeof especialidad !== 'undefined') updates.especialidad = especialidad;
    if (typeof bio !== 'undefined') updates.bio = bio;
    if (typeof email !== 'undefined') updates.email = email;
    if (typeof foto_media_id !== 'undefined') updates.foto_media_id = foto_media_id;
    if (typeof active !== 'undefined') updates.active = !!active;

    await docente.update(updates);
    return res.json(docente);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const docente = await db.Docente.findByPk(id);
    if (!docente) return res.status(404).json({ message: 'not found' });
    await docente.update({ active: false });
    return res.json({ id: docente.id, active: docente.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
