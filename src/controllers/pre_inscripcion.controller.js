const db = require('../models');

exports.list = async (req, res) => {
  try {
    const where = {};

    if (typeof req.query.active !== 'undefined') {
      const v = req.query.active.toString().toLowerCase();
      where.active = !(v === 'false' || v === '0');
    }

    if (req.query.course_id) where.course_id = parseInt(req.query.course_id, 10);
    if (req.query.sucursal_id) where.sucursal_id = parseInt(req.query.sucursal_id, 10);
    if (req.query.modalidad_id) where.modalidad_id = parseInt(req.query.modalidad_id, 10);
    if (typeof req.query.atendido !== 'undefined') {
      const v = req.query.atendido.toString().toLowerCase();
      where.atendido = (v === 'true' || v === '1');
    }

    const items = await db.PreInscripcion.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: db.Course, as: 'course', attributes: ['id', 'title', 'slug'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre', 'ciudad'] },
        { model: db.Modalidad, as: 'modalidad', attributes: ['id', 'nombre'] }
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
    const item = await db.PreInscripcion.findByPk(id, {
      include: [
        { model: db.Course, as: 'course', attributes: ['id', 'title', 'slug'] },
        { model: db.Sucursal, as: 'sucursal', attributes: ['id', 'nombre', 'ciudad'] },
        { model: db.Modalidad, as: 'modalidad', attributes: ['id', 'nombre'] }
      ]
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
    const {
      nombre,
      apellido,
      celular,
      dni,
      email,
      modalidad_id,
      course_id,
      sucursal_id,
      acepta_politicas
    } = req.body;

    if (!nombre) return res.status(400).json({ message: 'nombre required' });
    if (!apellido) return res.status(400).json({ message: 'apellido required' });
    if (!celular) return res.status(400).json({ message: 'celular required' });
    if (!dni) return res.status(400).json({ message: 'dni required' });
    if (!email) return res.status(400).json({ message: 'email required' });
    if (!modalidad_id) return res.status(400).json({ message: 'modalidad_id required' });
    if (!course_id) return res.status(400).json({ message: 'course_id required' });
    if (!sucursal_id) return res.status(400).json({ message: 'sucursal_id required' });
    if (acepta_politicas !== true && acepta_politicas !== 'true' && acepta_politicas !== 1 && acepta_politicas !== '1') {
      return res.status(400).json({ message: 'acepta_politicas must be true' });
    }


    const payload = {
      nombre,
      apellido,
      celular,
      dni,
      email,
      modalidad_id,
      course_id,
      sucursal_id,
      acepta_politicas: true,
      atendido: req.body.atendido === true || req.body.atendido === 'true' || req.body.atendido === 1 || req.body.atendido === '1' ? true : false
    };

    const item = await db.PreInscripcion.create(payload);

    return res.status(201).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.PreInscripcion.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    const {
      nombre,
      apellido,
      celular,
      dni,
      email,
      modalidad_id,
      course_id,
      sucursal_id,
      acepta_politicas,
      active,
      atendido
    } = req.body;

    const updates = {};
    if (typeof nombre !== 'undefined') updates.nombre = nombre;
    if (typeof apellido !== 'undefined') updates.apellido = apellido;
    if (typeof celular !== 'undefined') updates.celular = celular;
    if (typeof dni !== 'undefined') updates.dni = dni;
    if (typeof email !== 'undefined') updates.email = email;
    if (typeof modalidad_id !== 'undefined') updates.modalidad_id = modalidad_id;
    if (typeof course_id !== 'undefined') updates.course_id = course_id;
    if (typeof sucursal_id !== 'undefined') updates.sucursal_id = sucursal_id;
    if (typeof acepta_politicas !== 'undefined') updates.acepta_politicas = !!acepta_politicas;

    if (typeof active !== 'undefined') updates.active = !!active;
    if (typeof atendido !== 'undefined') updates.atendido = !!atendido;

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
    const item = await db.PreInscripcion.findByPk(id);
    if (!item) return res.status(404).json({ message: 'not found' });

    await item.update({ active: false });
    return res.json({ id: item.id, active: item.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
