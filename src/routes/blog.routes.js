const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');

// Listar blogs
router.get('/', blogController.list);

// Obtener blog por ID
router.get('/:id', blogController.getById);

// Crear blog
router.post('/', blogController.create);

// Actualizar blog
router.put('/:id', blogController.update);

// Eliminar blog (archivar)
router.delete('/:id', blogController.remove);

module.exports = router;