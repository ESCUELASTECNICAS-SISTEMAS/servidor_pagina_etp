const db = require('../models');

// Includes comunes para traer relaciones
const getIncludes = () => {
  return [
    { model: db.Media, as: 'thumbnail', attributes: ['id', 'url', 'alt_text'] },
    { model: db.Docente, as: 'docentes', attributes: ['id', 'nombre', 'especialidad', 'bio', 'email'], through: { attributes: ['rol'] }, include: [{ model: db.Media, as: 'foto', attributes: ['id', 'url', 'alt_text'] }] },
    { model: db.CourseSchedule, as: 'schedules', attributes: ['id', 'dia', 'turno', 'hora_inicio', 'hora_fin', 'aula'], required: false },
    { model: db.Certificado, as: 'certificados', attributes: ['id', 'titulo', 'descripcion', 'institucion_emisora', 'orden', 'active'], required: false },
    { model: db.Seminario, as: 'seminarios', attributes: ['id', 'titulo', 'descripcion', 'fecha', 'duracion_horas', 'orden'], required: false },
    { model: db.Convenio, as: 'convenios', attributes: ['id', 'institucion', 'descripcion', 'url', 'orden'], required: false, include: [{ model: db.Media, as: 'logo', attributes: ['id', 'url', 'alt_text'] }] }
  ];
};

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

    const includeInactive = req.query.include_inactive && req.query.include_inactive.toString().toLowerCase() === 'true';
    const courses = await db.Course.findAll({
      where,
      attributes: ['id', 'title', 'subtitle', 'description', 'type', 'slug', 'published', 'hours', 'duration', 'grado', 'registro', 'perfil_egresado', 'mision', 'vision', 'thumbnail_media_id', 'active', 'created_at'],
      include: getIncludes(includeInactive)
    });
    const out = courses.map(c => {
      const obj = c.toJSON();
      if (Array.isArray(obj.certificados)) {
        obj.certificados = obj.certificados.map(cert => ({ ...cert, active: typeof cert.active !== 'undefined' ? cert.active : true }));
      }
      return obj;
    });
    return res.json(out);
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
      attributes: ['id', 'title', 'subtitle', 'description', 'type', 'slug', 'published', 'thumbnail_media_id', 'hours', 'duration', 'grado', 'registro', 'perfil_egresado', 'mision', 'vision', 'active', 'created_at'],
      include: getIncludes(includeInactive)
    });
    if (!course) return res.status(404).json({ message: 'not found' });
    if (course.active === false && !includeInactive) return res.status(404).json({ message: 'not found' });
    const obj = course.toJSON();
    if (Array.isArray(obj.certificados)) {
      obj.certificados = obj.certificados.map(cert => ({ ...cert, active: typeof cert.active !== 'undefined' ? cert.active : true }));
    }
    return res.json(obj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, subtitle, description, type, thumbnail_media_id, slug, published, hours, duration, grado, registro, perfil_egresado, mision, vision } = req.body;
    if (!title || !type) return res.status(400).json({ message: 'title and type required' });
    const course = await db.Course.create({ title, subtitle, description, type, thumbnail_media_id, slug, published: !!published, hours, duration, grado, registro, perfil_egresado, mision, vision });
    return res.status(201).json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, type, thumbnail_media_id, slug, published, active, hours, duration, grado, registro, perfil_egresado, mision, vision } = req.body;
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
    if (typeof hours !== 'undefined') updates.hours = hours;
    if (typeof duration !== 'undefined') updates.duration = duration;
    if (typeof grado !== 'undefined') updates.grado = grado;
    if (typeof registro !== 'undefined') updates.registro = registro;
    if (typeof perfil_egresado !== 'undefined') updates.perfil_egresado = perfil_egresado;
    if (typeof mision !== 'undefined') updates.mision = mision;
    if (typeof vision !== 'undefined') updates.vision = vision;
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

// ===================== DOCENTES =====================
exports.addDocente = async (req, res) => {
  try {
    const { id } = req.params; // course_id
    const { docente_id, rol } = req.body;
    if (!docente_id) return res.status(400).json({ message: 'docente_id required' });

    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'course not found' });

    const docente = await db.Docente.findByPk(docente_id);
    if (!docente) return res.status(404).json({ message: 'docente not found' });

    const [link, created] = await db.CourseDocente.findOrCreate({
      where: { course_id: id, docente_id },
      defaults: { rol }
    });
    if (!created && rol) await link.update({ rol });

    return res.status(created ? 201 : 200).json(link);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.removeDocente = async (req, res) => {
  try {
    const { id, docenteId } = req.params;
    const deleted = await db.CourseDocente.destroy({ where: { course_id: id, docente_id: docenteId } });
    if (!deleted) return res.status(404).json({ message: 'relation not found' });
    return res.json({ message: 'removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

// ===================== SCHEDULES =====================
exports.addSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { dia, turno, hora_inicio, hora_fin, aula } = req.body;
    if (!dia) return res.status(400).json({ message: 'dia required' });

    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'course not found' });

    const schedule = await db.CourseSchedule.create({ course_id: id, dia, turno, hora_inicio, hora_fin, aula });
    return res.status(201).json(schedule);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id, scheduleId } = req.params;
    const { dia, turno, hora_inicio, hora_fin, aula, active } = req.body;

    const schedule = await db.CourseSchedule.findOne({ where: { id: scheduleId, course_id: id } });
    if (!schedule) return res.status(404).json({ message: 'schedule not found' });

    const updates = {};
    if (typeof dia !== 'undefined') updates.dia = dia;
    if (typeof turno !== 'undefined') updates.turno = turno;
    if (typeof hora_inicio !== 'undefined') updates.hora_inicio = hora_inicio;
    if (typeof hora_fin !== 'undefined') updates.hora_fin = hora_fin;
    if (typeof aula !== 'undefined') updates.aula = aula;
    if (typeof active !== 'undefined') updates.active = !!active;

    await schedule.update(updates);
    return res.json(schedule);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.removeSchedule = async (req, res) => {
  try {
    const { id, scheduleId } = req.params;
    const schedule = await db.CourseSchedule.findOne({ where: { id: scheduleId, course_id: id } });
    if (!schedule) return res.status(404).json({ message: 'schedule not found' });
    await schedule.update({ active: false });
    return res.json({ id: schedule.id, active: schedule.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

// ===================== CERTIFICADOS =====================
exports.addCertificado = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, institucion_emisora, orden } = req.body;
    if (!titulo) return res.status(400).json({ message: 'titulo required' });

    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'course not found' });

    const cert = await db.Certificado.create({ course_id: id, titulo, descripcion, institucion_emisora, orden });
    return res.status(201).json(cert);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.updateCertificado = async (req, res) => {
  try {
    const { id, certId } = req.params;
    const { titulo, descripcion, institucion_emisora, orden, active } = req.body;

    const cert = await db.Certificado.findOne({ where: { id: certId, course_id: id } });
    if (!cert) return res.status(404).json({ message: 'certificado not found' });

    const updates = {};
    if (typeof titulo !== 'undefined') updates.titulo = titulo;
    if (typeof descripcion !== 'undefined') updates.descripcion = descripcion;
    if (typeof institucion_emisora !== 'undefined') updates.institucion_emisora = institucion_emisora;
    if (typeof orden !== 'undefined') updates.orden = orden;
    if (typeof active !== 'undefined') updates.active = !!active;

    await cert.update(updates);
    return res.json(cert);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.removeCertificado = async (req, res) => {
  try {
    const { id, certId } = req.params;
    const cert = await db.Certificado.findOne({ where: { id: certId, course_id: id } });
    if (!cert) return res.status(404).json({ message: 'certificado not found' });
    await cert.update({ active: false });
    return res.json({ id: cert.id, active: cert.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

// ===================== SEMINARIOS =====================
exports.addSeminario = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, duracion_horas, orden } = req.body;
    if (!titulo) return res.status(400).json({ message: 'titulo required' });

    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'course not found' });

    const sem = await db.Seminario.create({ course_id: id, titulo, descripcion, fecha, duracion_horas, orden });
    return res.status(201).json(sem);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.updateSeminario = async (req, res) => {
  try {
    const { id, semId } = req.params;
    const { titulo, descripcion, fecha, duracion_horas, orden, active } = req.body;

    const sem = await db.Seminario.findOne({ where: { id: semId, course_id: id } });
    if (!sem) return res.status(404).json({ message: 'seminario not found' });

    const updates = {};
    if (typeof titulo !== 'undefined') updates.titulo = titulo;
    if (typeof descripcion !== 'undefined') updates.descripcion = descripcion;
    if (typeof fecha !== 'undefined') updates.fecha = fecha;
    if (typeof duracion_horas !== 'undefined') updates.duracion_horas = duracion_horas;
    if (typeof orden !== 'undefined') updates.orden = orden;
    if (typeof active !== 'undefined') updates.active = !!active;

    await sem.update(updates);
    return res.json(sem);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.removeSeminario = async (req, res) => {
  try {
    const { id, semId } = req.params;
    const sem = await db.Seminario.findOne({ where: { id: semId, course_id: id } });
    if (!sem) return res.status(404).json({ message: 'seminario not found' });
    await sem.update({ active: false });
    return res.json({ id: sem.id, active: sem.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

// ===================== CONVENIOS =====================
exports.addConvenio = async (req, res) => {
  try {
    const { id } = req.params;
    const { institucion, descripcion, url, logo_media_id, orden } = req.body;
    if (!institucion) return res.status(400).json({ message: 'institucion required' });

    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'course not found' });

    const conv = await db.Convenio.create({ course_id: id, institucion, descripcion, url, logo_media_id, orden });
    return res.status(201).json(conv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.updateConvenio = async (req, res) => {
  try {
    const { id, convId } = req.params;
    const { institucion, descripcion, url, logo_media_id, orden, active } = req.body;

    const conv = await db.Convenio.findOne({ where: { id: convId, course_id: id } });
    if (!conv) return res.status(404).json({ message: 'convenio not found' });

    const updates = {};
    if (typeof institucion !== 'undefined') updates.institucion = institucion;
    if (typeof descripcion !== 'undefined') updates.descripcion = descripcion;
    if (typeof url !== 'undefined') updates.url = url;
    if (typeof logo_media_id !== 'undefined') updates.logo_media_id = logo_media_id;
    if (typeof orden !== 'undefined') updates.orden = orden;
    if (typeof active !== 'undefined') updates.active = !!active;

    await conv.update(updates);
    return res.json(conv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.removeConvenio = async (req, res) => {
  try {
    const { id, convId } = req.params;
    const conv = await db.Convenio.findOne({ where: { id: convId, course_id: id } });
    if (!conv) return res.status(404).json({ message: 'convenio not found' });
    await conv.update({ active: false });
    return res.json({ id: conv.id, active: conv.active });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
