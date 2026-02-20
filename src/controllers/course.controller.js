const db = require('../models');

// Includes comunes para traer relaciones
const getIncludes = () => {
  return [
    { model: db.Media, as: 'thumbnail', attributes: ['id', 'url', 'alt_text'] },
    { model: db.Media, as: 'horarios', attributes: ['id', 'url', 'alt_text'] },
    { model: db.Docente, as: 'docentes', attributes: ['id', 'nombre', 'especialidad', 'bio', 'email'], through: { attributes: ['rol'] }, include: [{ model: db.Media, as: 'foto', attributes: ['id', 'url', 'alt_text'] }] },
    { model: db.Certificado, as: 'certificados', attributes: ['id', 'titulo', 'descripcion', 'institucion_emisora', 'orden', 'active'], required: false },
    { model: db.Seminario, as: 'seminarios', attributes: ['id', 'titulo', 'descripcion', 'fecha', 'duracion_horas', 'orden'], required: false },
    { model: db.Convenio, as: 'convenios', attributes: ['id', 'institucion', 'descripcion', 'url', 'orden'], required: false, include: [{ model: db.Media, as: 'logo', attributes: ['id', 'url', 'alt_text'] }] }
  ];
};

const tryParseJSON = (s) => {
  if (typeof s !== 'string') return s;
  const t = s.trim();
  if (!(t.startsWith('{') || t.startsWith('['))) return s;
  try {
    return JSON.parse(s);
  } catch (e) {
    return s;
  }
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
      attributes: ['id', 'title', 'subtitle', 'description', 'type', 'slug', 'published', 'hours', 'duration', 'grado', 'registro', 'perfil_egresado', 'mision', 'vision', 'modalidad', 'temario', 'razones_para_estudiar', 'publico_objetivo', 'modulos', 'thumbnail_media_id', 'horarios_media_id', 'active', 'created_at'],
      include: getIncludes(includeInactive)
    });
    const out = courses.map(c => {
      const obj = c.toJSON();
      // si `temario` fue guardado como JSON string, devolverlo parsed
      if (typeof obj.temario === 'string') obj.temario = tryParseJSON(obj.temario);
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
      attributes: ['id', 'title', 'subtitle', 'description', 'type', 'slug', 'published', 'thumbnail_media_id', 'hours', 'duration', 'grado', 'registro', 'perfil_egresado', 'mision', 'vision', 'modalidad', 'temario', 'razones_para_estudiar', 'publico_objetivo', 'modulos', 'horarios_media_id', 'active', 'created_at'],
      include: getIncludes(includeInactive)
    });
    if (!course) return res.status(404).json({ message: 'not found' });
    if (course.active === false && !includeInactive) return res.status(404).json({ message: 'not found' });
    const obj = course.toJSON();
    if (typeof obj.temario === 'string') obj.temario = tryParseJSON(obj.temario);
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
    console.log('create course body:', req.body);
    const body = req.body || {};
    const san = v => (typeof v === 'string' ? (v.trim() === '' ? undefined : v) : v);
    const title = san(body.title);
    const subtitle = san(body.subtitle);
    const description = san(body.description);
    const type = san(body.type);
    const slug = san(body.slug);
    const duration = san(body.duration);
    const grado = san(body.grado);
    const registro = san(body.registro);
    const perfil_egresado = san(body.perfil_egresado);
    const mision = san(body.mision);
    const vision = san(body.vision);
    const modalidad = san(body.modalidad);
    const razones_para_estudiar = san(body.razones_para_estudiar);
    const publico_objetivo = san(body.publico_objetivo);

    let temario = body.temario;
    if (Array.isArray(temario)) temario = JSON.stringify(temario);
    if (typeof temario === 'string' && temario.trim() === '') temario = undefined;

    let modulos = body.modulos;
    if (Array.isArray(modulos) || (modulos && typeof modulos === 'object')) modulos = JSON.stringify(modulos);
    if (typeof modulos === 'string' && modulos.trim() === '') modulos = undefined;

    const missing = [];
    if (!title) missing.push('title');
    if (!type) missing.push('type');
    if (missing.length) return res.status(400).json({ message: 'missing required fields', missing });

    const payload = {};
    payload.title = title;
    if (typeof subtitle !== 'undefined') payload.subtitle = subtitle;
    if (typeof description !== 'undefined') payload.description = description;
    payload.type = type;
    if (typeof body.thumbnail_media_id !== 'undefined') payload.thumbnail_media_id = body.thumbnail_media_id;
    if (typeof body.horarios_media_id !== 'undefined') payload.horarios_media_id = body.horarios_media_id;
    if (typeof slug !== 'undefined') payload.slug = slug;
    if (typeof body.published !== 'undefined') payload.published = !!body.published;
    if (typeof body.hours !== 'undefined') payload.hours = body.hours;
    if (typeof duration !== 'undefined') payload.duration = duration;
    if (typeof grado !== 'undefined') payload.grado = grado;
    if (typeof registro !== 'undefined') payload.registro = registro;
    if (typeof perfil_egresado !== 'undefined') payload.perfil_egresado = perfil_egresado;
    if (typeof mision !== 'undefined') payload.mision = mision;
    if (typeof vision !== 'undefined') payload.vision = vision;
    if (typeof modalidad !== 'undefined') payload.modalidad = modalidad;
    if (typeof razones_para_estudiar !== 'undefined') payload.razones_para_estudiar = razones_para_estudiar;
    if (typeof publico_objetivo !== 'undefined') payload.publico_objetivo = publico_objetivo;
    if (typeof temario !== 'undefined') payload.temario = temario;
    if (typeof modulos !== 'undefined') payload.modulos = modulos;

    const course = await db.Course.create(payload);
    return res.status(201).json(course);
  } catch (err) {
    console.error(err);
    // Return error message/details to help debugging in development
    const details = err && err.errors ? err.errors.map(e => e.message) : null;
    return res.status(500).json({ message: 'server error', error: err.message, details });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, type, thumbnail_media_id, horarios_media_id, slug, published, active, hours, duration, grado, registro, perfil_egresado, mision, vision, modalidad, razones_para_estudiar, publico_objetivo } = req.body;
    let temario = req.body && typeof req.body.temario !== 'undefined' ? req.body.temario : undefined;
    let modulos = req.body && typeof req.body.modulos !== 'undefined' ? req.body.modulos : undefined;
    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'not found' });

    const updates = {};
    if (typeof title !== 'undefined') updates.title = title;
    if (typeof subtitle !== 'undefined') updates.subtitle = subtitle;
    if (typeof description !== 'undefined') updates.description = description;
    if (typeof type !== 'undefined') updates.type = type;
    if (typeof thumbnail_media_id !== 'undefined') updates.thumbnail_media_id = thumbnail_media_id;
    if (typeof horarios_media_id !== 'undefined') updates.horarios_media_id = horarios_media_id;
    if (typeof slug !== 'undefined') updates.slug = slug;
    if (typeof published !== 'undefined') updates.published = !!published;
    if (typeof hours !== 'undefined') updates.hours = hours;
    if (typeof duration !== 'undefined') updates.duration = duration;
    if (typeof grado !== 'undefined') updates.grado = grado;
    if (typeof registro !== 'undefined') updates.registro = registro;
    if (typeof perfil_egresado !== 'undefined') updates.perfil_egresado = perfil_egresado;
    if (typeof mision !== 'undefined') updates.mision = mision;
    if (typeof vision !== 'undefined') updates.vision = vision;
    if (typeof modalidad !== 'undefined') updates.modalidad = modalidad;
    if (typeof razones_para_estudiar !== 'undefined') updates.razones_para_estudiar = razones_para_estudiar;
    if (typeof publico_objetivo !== 'undefined') updates.publico_objetivo = publico_objetivo;
    if (typeof temario !== 'undefined') {
      let t = temario;
      if (Array.isArray(t) || (t && typeof t === 'object')) t = JSON.stringify(t);
      if (typeof t === 'string' && t.trim() === '') t = undefined;
      if (typeof t !== 'undefined') updates.temario = t;
    }
    if (typeof modulos !== 'undefined') {
      let m = modulos;
      if (Array.isArray(m) || (m && typeof m === 'object')) m = JSON.stringify(m);
      if (typeof m === 'string' && m.trim() === '') m = undefined;
      if (typeof m !== 'undefined') updates.modulos = m;
    }
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
