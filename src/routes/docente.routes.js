const express = require('express');
const router = express.Router();
const controller = require('../controllers/docente.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authenticate, requireAdmin, controller.create);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

module.exports = router;
