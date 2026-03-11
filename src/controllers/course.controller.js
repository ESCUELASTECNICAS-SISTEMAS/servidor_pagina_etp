const db = require('../models');

// Includes comunes para traer relaciones
const getIncludes = () => {
  return [
    { model: db.Media, as: 'thumbnail', attributes: ['id', 'url', 'alt_text'] },
    { model: db.Media, as: 'horarios', attributes: ['id', 'url', 'alt_text'] },
    { model: db.Media, as: 'extraImage', attributes: ['id', 'url', 'alt_text'] },
    { model: db.Media, as: 'extra_media', attributes: ['id', 'url', 'alt_text'], through: { attributes: ['position', 'active'] }, required: false },
    { model: db.Sucursal, as: 'sucursales', attributes: ['id', 'nombre', 'ciudad', 'direccion', 'telefono', 'email', 'active'], through: { attributes: ['id', 'active', 'created_at'] }, required: false },
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

const parseNullableDecimal = (v) => {
  if (typeof v === 'undefined' || v === null) return undefined;
  if (typeof v === 'string' && v.trim() === '') return undefined;
  const n = Number(v);
  if (Number.isNaN(n)) return undefined;
  return n;
};

const parseBooleanish = (v) => {
  if (typeof v === 'undefined') return undefined;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    if (t === 'false' || t === '0' || t === 'no' || t === 'off') return false;
    if (t === 'true' || t === '1' || t === 'si' || t === 'sí' || t === 'yes' || t === 'on') return true;
  }
  return !!v;
};

const toOptionalPositiveInt = (v) => {
  if (typeof v === 'undefined' || v === null) return undefined;
  if (typeof v === 'string' && v.trim() === '') return undefined;
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
};

const normalizeModalidad = (v) => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim().toLowerCase();
  if (!t) return undefined;
  if (t === 'híbrido') return 'hibrido';
  if (t === 'mixto') return 'hibrido';
  return t;
};

const flagsFromModalidad = (modalidad) => {
  const m = normalizeModalidad(modalidad);
  if (m === 'virtual') return { is_virtual: true, is_presencial: false };
  if (m === 'presencial') return { is_virtual: false, is_presencial: true };
  if (m === 'hibrido') return { is_virtual: true, is_presencial: true };
  return undefined;
};

const modalidadFromFlags = (isVirtual, isPresencial) => {
  if (isVirtual && isPresencial) return 'hibrido';
  if (isVirtual) return 'virtual';
  if (isPresencial) return 'presencial';
  return null;
};

const parseSucursalIds = (value) => {
  if (typeof value === 'undefined' || value === null) return undefined;
  if (!Array.isArray(value)) return null;

  const uniq = [...new Set(value.map(v => Number(v)))];
  if (uniq.some(v => !Number.isInteger(v) || v <= 0)) return null;
  return uniq;
};

const ensureValidSucursalIds = async (sucursalIds) => {
  if (!Array.isArray(sucursalIds) || sucursalIds.length === 0) return;
  const rows = await db.Sucursal.findAll({ where: { id: sucursalIds, active: true }, attributes: ['id'] });
  if (rows.length !== sucursalIds.length) {
    throw new Error('invalid_sucursal_ids');
  }
};

const syncCourseSucursales = async (courseId, sucursalIds) => {
  await db.CourseSucursal.destroy({ where: { course_id: courseId } });
  if (!Array.isArray(sucursalIds) || sucursalIds.length === 0) return;
  await db.CourseSucursal.bulkCreate(
    sucursalIds.map(sucursalId => ({ course_id: courseId, sucursal_id: sucursalId, active: true }))
  );
};

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (typeof req.query.virtual !== 'undefined') {
      const v = req.query.virtual.toString().toLowerCase();
      where.is_virtual = !(v === 'false' || v === '0' || v === 'no' || v === 'off');
    }
    if (typeof req.query.presencial !== 'undefined') {
      const v = req.query.presencial.toString().toLowerCase();
      where.is_presencial = !(v === 'false' || v === '0' || v === 'no' || v === 'off');
    }
    if (req.query.modalidad) {
      const flags = flagsFromModalidad(req.query.modalidad);
      if (flags) {
        where.is_virtual = flags.is_virtual;
        where.is_presencial = flags.is_presencial;
      }
    }
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
      attributes: ['id', 'title', 'subtitle', 'description', 'type', 'slug', 'published', 'hours', 'duration', 'grado', 'registro', 'perfil_egresado', 'mision', 'vision', 'modalidad', 'is_virtual', 'is_presencial', 'temario', 'razones_para_estudiar', 'publico_objetivo', 'precio', 'descuento', 'oferta', 'matricula', 'modulos', 'thumbnail_media_id', 'horarios_media_id', 'extra_media_id', 'active', 'created_at'],
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
      attributes: ['id', 'title', 'subtitle', 'description', 'type', 'slug', 'published', 'thumbnail_media_id', 'hours', 'duration', 'grado', 'registro', 'perfil_egresado', 'mision', 'vision', 'modalidad', 'is_virtual', 'is_presencial', 'temario', 'razones_para_estudiar', 'publico_objetivo', 'precio', 'descuento', 'oferta', 'matricula', 'modulos', 'horarios_media_id', 'extra_media_id', 'active', 'created_at'],
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
    const sucursal_ids = parseSucursalIds(body.sucursal_ids);
    const is_virtual = parseBooleanish(body.is_virtual);
    const is_presencial = parseBooleanish(body.is_presencial);
    const razones_para_estudiar = san(body.razones_para_estudiar);
    const publico_objetivo = san(body.publico_objetivo);
    const precio = parseNullableDecimal(body.precio);
    const descuento = parseNullableDecimal(body.descuento);
    const oferta = parseBooleanish(body.oferta);
    const matricula = parseNullableDecimal(body.matricula);

    if (typeof body.descuento !== 'undefined' && typeof descuento === 'undefined') {
      return res.status(400).json({ message: 'descuento must be a valid number' });
    }

    if (typeof body.extra_media_id !== 'undefined') {
      const extraMediaId = toOptionalPositiveInt(body.extra_media_id);
      if (typeof extraMediaId === 'undefined') {
        return res.status(400).json({ message: 'extra_media_id must be a positive integer' });
      }
    }
    if (typeof body.sucursal_ids !== 'undefined' && sucursal_ids === null) {
      return res.status(400).json({ message: 'sucursal_ids must be an array of positive integers' });
    }
    if (Array.isArray(sucursal_ids)) {
      await ensureValidSucursalIds(sucursal_ids);
    }

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
    const extraMediaId = toOptionalPositiveInt(body.extra_media_id);
    if (typeof extraMediaId !== 'undefined') payload.extra_media_id = extraMediaId;
    if (typeof slug !== 'undefined') payload.slug = slug;
    if (typeof body.published !== 'undefined') payload.published = !!body.published;
    if (typeof body.hours !== 'undefined') payload.hours = body.hours;
    if (typeof duration !== 'undefined') payload.duration = duration;
    if (typeof grado !== 'undefined') payload.grado = grado;
    if (typeof registro !== 'undefined') payload.registro = registro;
    if (typeof perfil_egresado !== 'undefined') payload.perfil_egresado = perfil_egresado;
    if (typeof mision !== 'undefined') payload.mision = mision;
    if (typeof vision !== 'undefined') payload.vision = vision;
    if (typeof is_virtual !== 'undefined') payload.is_virtual = is_virtual;
    if (typeof is_presencial !== 'undefined') payload.is_presencial = is_presencial;

    if (typeof modalidad !== 'undefined' && (typeof is_virtual === 'undefined' || typeof is_presencial === 'undefined')) {
      const flags = flagsFromModalidad(modalidad);
      if (flags) {
        if (typeof is_virtual === 'undefined') payload.is_virtual = flags.is_virtual;
        if (typeof is_presencial === 'undefined') payload.is_presencial = flags.is_presencial;
      }
    }

    if (typeof payload.is_virtual !== 'undefined' || typeof payload.is_presencial !== 'undefined') {
      const finalVirtual = typeof payload.is_virtual === 'undefined' ? false : payload.is_virtual;
      const finalPresencial = typeof payload.is_presencial === 'undefined' ? false : payload.is_presencial;
      payload.modalidad = modalidadFromFlags(finalVirtual, finalPresencial);
    } else if (typeof modalidad !== 'undefined') {
      payload.modalidad = normalizeModalidad(modalidad) || modalidad;
    }
    if (typeof razones_para_estudiar !== 'undefined') payload.razones_para_estudiar = razones_para_estudiar;
    if (typeof publico_objetivo !== 'undefined') payload.publico_objetivo = publico_objetivo;
    if (typeof precio !== 'undefined') payload.precio = precio;
    if (typeof descuento !== 'undefined') payload.descuento = descuento;
    if (typeof oferta !== 'undefined') payload.oferta = oferta;
    if (typeof matricula !== 'undefined') payload.matricula = matricula;
    if (typeof temario !== 'undefined') payload.temario = temario;
    if (typeof modulos !== 'undefined') payload.modulos = modulos;

    if (typeof body.sucursal_id !== 'undefined') {
      const sucursalPrincipal = toOptionalPositiveInt(body.sucursal_id);
      if (typeof sucursalPrincipal === 'undefined') {
        return res.status(400).json({ message: 'sucursal_id must be a positive integer' });
      }
      payload.sucursal_id = sucursalPrincipal;
    }
    if (Array.isArray(sucursal_ids) && sucursal_ids.length > 0 && typeof payload.sucursal_id === 'undefined') {
      payload.sucursal_id = sucursal_ids[0];
    }

    const course = await db.Course.create(payload);
    if (Array.isArray(sucursal_ids)) {
      await syncCourseSucursales(course.id, sucursal_ids);
    }
    const created = await db.Course.findByPk(course.id, {
      attributes: ['id', 'title', 'subtitle', 'description', 'type', 'slug', 'published', 'thumbnail_media_id', 'hours', 'duration', 'grado', 'registro', 'perfil_egresado', 'mision', 'vision', 'modalidad', 'is_virtual', 'is_presencial', 'temario', 'razones_para_estudiar', 'publico_objetivo', 'precio', 'descuento', 'oferta', 'matricula', 'modulos', 'sucursal_id', 'horarios_media_id', 'extra_media_id', 'active', 'created_at'],
      include: getIncludes()
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    if (err && err.message === 'invalid_sucursal_ids') {
      return res.status(400).json({ message: 'one or more sucursal_ids are invalid or inactive' });
    }
    // Return error message/details to help debugging in development
    const details = err && err.errors ? err.errors.map(e => e.message) : null;
    return res.status(500).json({ message: 'server error', error: err.message, details });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, type, thumbnail_media_id, horarios_media_id, slug, published, active, hours, duration, grado, registro, perfil_egresado, mision, vision, modalidad, razones_para_estudiar, publico_objetivo } = req.body;
    const sucursal_ids = parseSucursalIds(req.body.sucursal_ids);
    const is_virtual = parseBooleanish(req.body.is_virtual);
    const is_presencial = parseBooleanish(req.body.is_presencial);
    const precio = parseNullableDecimal(req.body.precio);
    const descuento = parseNullableDecimal(req.body.descuento);
    const oferta = parseBooleanish(req.body.oferta);
    const matricula = parseNullableDecimal(req.body.matricula);

    if (typeof req.body.descuento !== 'undefined' && typeof descuento === 'undefined') {
      return res.status(400).json({ message: 'descuento must be a valid number' });
    }
    if (typeof req.body.extra_media_id !== 'undefined' && req.body.extra_media_id !== null) {
      const extraMediaId = toOptionalPositiveInt(req.body.extra_media_id);
      if (typeof extraMediaId === 'undefined') {
        return res.status(400).json({ message: 'extra_media_id must be a positive integer' });
      }
    }
    if (typeof req.body.sucursal_ids !== 'undefined' && sucursal_ids === null) {
      return res.status(400).json({ message: 'sucursal_ids must be an array of positive integers' });
    }
    if (Array.isArray(sucursal_ids)) {
      await ensureValidSucursalIds(sucursal_ids);
    }
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
    const hasExtraMediaInput = Object.prototype.hasOwnProperty.call(req.body, 'extra_media_id');
    if (hasExtraMediaInput) {
      const extraMediaId = toOptionalPositiveInt(req.body.extra_media_id);

      if (
        req.body.extra_media_id === null ||
        (typeof req.body.extra_media_id === 'string' && req.body.extra_media_id.trim() === '')
      ) {
        updates.extra_media_id = null;
      } else if (typeof extraMediaId !== 'undefined') {
        updates.extra_media_id = extraMediaId;
      }
    }
    if (typeof slug !== 'undefined') updates.slug = slug;
    if (typeof published !== 'undefined') updates.published = !!published;
    if (typeof hours !== 'undefined') updates.hours = hours;
    if (typeof duration !== 'undefined') updates.duration = duration;
    if (typeof grado !== 'undefined') updates.grado = grado;
    if (typeof registro !== 'undefined') updates.registro = registro;
    if (typeof perfil_egresado !== 'undefined') updates.perfil_egresado = perfil_egresado;
    if (typeof mision !== 'undefined') updates.mision = mision;
    if (typeof vision !== 'undefined') updates.vision = vision;
    if (typeof is_virtual !== 'undefined') updates.is_virtual = is_virtual;
    if (typeof is_presencial !== 'undefined') updates.is_presencial = is_presencial;
    if (typeof modalidad !== 'undefined' && (typeof is_virtual === 'undefined' || typeof is_presencial === 'undefined')) {
      const flags = flagsFromModalidad(modalidad);
      if (flags) {
        if (typeof is_virtual === 'undefined') updates.is_virtual = flags.is_virtual;
        if (typeof is_presencial === 'undefined') updates.is_presencial = flags.is_presencial;
      }
    }

    const nextVirtual = typeof updates.is_virtual !== 'undefined' ? updates.is_virtual : course.is_virtual;
    const nextPresencial = typeof updates.is_presencial !== 'undefined' ? updates.is_presencial : course.is_presencial;
    if (
      typeof updates.is_virtual !== 'undefined' ||
      typeof updates.is_presencial !== 'undefined' ||
      typeof modalidad !== 'undefined'
    ) {
      updates.modalidad = modalidadFromFlags(nextVirtual, nextPresencial);
    }
    if (typeof razones_para_estudiar !== 'undefined') updates.razones_para_estudiar = razones_para_estudiar;
    if (typeof publico_objetivo !== 'undefined') updates.publico_objetivo = publico_objetivo;
    if (typeof precio !== 'undefined') updates.precio = precio;
    if (typeof descuento !== 'undefined') updates.descuento = descuento;
    if (typeof matricula !== 'undefined') updates.matricula = matricula;
    if (typeof oferta !== 'undefined') updates.oferta = oferta;
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

    if (typeof req.body.sucursal_id !== 'undefined') {
      const sucursalPrincipal = toOptionalPositiveInt(req.body.sucursal_id);
      if (typeof sucursalPrincipal === 'undefined') {
        return res.status(400).json({ message: 'sucursal_id must be a positive integer' });
      }
      updates.sucursal_id = sucursalPrincipal;
    }
    if (Array.isArray(sucursal_ids) && sucursal_ids.length > 0) {
      updates.sucursal_id = sucursal_ids[0];
    }

    await course.update(updates);
    if (Array.isArray(sucursal_ids)) {
      await syncCourseSucursales(course.id, sucursal_ids);
    }
    const updated = await db.Course.findByPk(course.id, {
      attributes: ['id', 'title', 'subtitle', 'description', 'type', 'slug', 'published', 'thumbnail_media_id', 'hours', 'duration', 'grado', 'registro', 'perfil_egresado', 'mision', 'vision', 'modalidad', 'is_virtual', 'is_presencial', 'temario', 'razones_para_estudiar', 'publico_objetivo', 'precio', 'descuento', 'oferta', 'matricula', 'modulos', 'sucursal_id', 'horarios_media_id', 'extra_media_id', 'active', 'created_at'],
      include: getIncludes()
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    if (err && err.message === 'invalid_sucursal_ids') {
      return res.status(400).json({ message: 'one or more sucursal_ids are invalid or inactive' });
    }
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

// ===================== SUCURSALES =====================
exports.setSucursales = async (req, res) => {
  try {
    const { id } = req.params;
    const sucursal_ids = parseSucursalIds(req.body.sucursal_ids);
    if (sucursal_ids === null) {
      return res.status(400).json({ message: 'sucursal_ids must be an array of positive integers' });
    }

    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'course not found' });

    const ids = Array.isArray(sucursal_ids) ? sucursal_ids : [];
    await ensureValidSucursalIds(ids);
    await syncCourseSucursales(course.id, ids);

    if (ids.length > 0) {
      await course.update({ sucursal_id: ids[0] });
    }

    const refreshed = await db.Course.findByPk(course.id, {
      attributes: ['id', 'title', 'sucursal_id', 'active', 'created_at'],
      include: [{ model: db.Sucursal, as: 'sucursales', attributes: ['id', 'nombre', 'ciudad', 'direccion', 'telefono', 'email', 'active'], through: { attributes: ['id', 'active', 'created_at'] }, required: false }]
    });
    return res.json(refreshed);
  } catch (err) {
    console.error(err);
    if (err && err.message === 'invalid_sucursal_ids') {
      return res.status(400).json({ message: 'one or more sucursal_ids are invalid or inactive' });
    }
    return res.status(500).json({ message: 'server error' });
  }
};

exports.removeSucursal = async (req, res) => {
  try {
    const { id, sucursalId } = req.params;
    const course = await db.Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'course not found' });

    const deleted = await db.CourseSucursal.destroy({ where: { course_id: id, sucursal_id: sucursalId } });
    if (!deleted) return res.status(404).json({ message: 'relation not found' });

    const first = await db.CourseSucursal.findOne({ where: { course_id: id }, order: [['id', 'ASC']] });
    await course.update({ sucursal_id: first ? first.sucursal_id : null });

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
