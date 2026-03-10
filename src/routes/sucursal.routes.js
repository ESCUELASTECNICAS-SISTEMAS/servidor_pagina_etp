const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursal.controller');

router.get('/', sucursalController.list);
router.get('/:id', sucursalController.getById);
router.post('/', sucursalController.create);
router.put('/:id', sucursalController.update);
router.delete('/:id', sucursalController.remove);

module.exports = router;
