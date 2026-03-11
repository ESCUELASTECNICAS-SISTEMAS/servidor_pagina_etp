const express = require('express');
const router = express.Router();
const controller = require('../controllers/course.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// CRUD principal de courses
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authenticate, requireAdmin, controller.create);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

// Docentes de un curso
router.post('/:id/docentes', authenticate, requireAdmin, controller.addDocente);
router.delete('/:id/docentes/:docenteId', authenticate, requireAdmin, controller.removeDocente);

// Sucursales de un curso
router.put('/:id/sucursales', authenticate, requireAdmin, controller.setSucursales);
router.delete('/:id/sucursales/:sucursalId', authenticate, requireAdmin, controller.removeSucursal);

// Certificados de un curso
router.post('/:id/certificados', authenticate, requireAdmin, controller.addCertificado);
router.put('/:id/certificados/:certId', authenticate, requireAdmin, controller.updateCertificado);
router.delete('/:id/certificados/:certId', authenticate, requireAdmin, controller.removeCertificado);

// Seminarios de un curso
router.post('/:id/seminarios', authenticate, requireAdmin, controller.addSeminario);
router.put('/:id/seminarios/:semId', authenticate, requireAdmin, controller.updateSeminario);
router.delete('/:id/seminarios/:semId', authenticate, requireAdmin, controller.removeSeminario);

// Convenios de un curso
router.post('/:id/convenios', authenticate, requireAdmin, controller.addConvenio);
router.put('/:id/convenios/:convId', authenticate, requireAdmin, controller.updateConvenio);
router.delete('/:id/convenios/:convId', authenticate, requireAdmin, controller.removeConvenio);

// Extra media (imagenes adicionales del curso)
router.post('/:id/extra-media', authenticate, requireAdmin, controller.addExtraMedia);
router.put('/:id/extra-media', authenticate, requireAdmin, controller.setExtraMedia);
router.delete('/:id/extra-media/:mediaId', authenticate, requireAdmin, controller.removeExtraMedia);

module.exports = router;
