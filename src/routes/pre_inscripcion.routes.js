const express = require('express');
const router = express.Router();
const preInscripcionController = require('../controllers/pre_inscripcion.controller');

router.get('/', preInscripcionController.list);
router.get('/:id', preInscripcionController.getById);
router.post('/', preInscripcionController.create);
router.put('/:id', preInscripcionController.update);
router.delete('/:id', preInscripcionController.remove);

module.exports = router;
