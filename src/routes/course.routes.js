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

// Schedules de un curso
router.post('/:id/schedules', authenticate, requireAdmin, controller.addSchedule);
router.put('/:id/schedules/:scheduleId', authenticate, requireAdmin, controller.updateSchedule);
router.delete('/:id/schedules/:scheduleId', authenticate, requireAdmin, controller.removeSchedule);

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

module.exports = router;
