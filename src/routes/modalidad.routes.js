const express = require('express');
const router = express.Router();
const modalidadController = require('../controllers/modalidad.controller');

router.get('/', modalidadController.list);
router.get('/:id', modalidadController.getById);
router.post('/', modalidadController.create);
router.put('/:id', modalidadController.update);
router.delete('/:id', modalidadController.remove);

module.exports = router;
