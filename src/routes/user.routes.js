const express = require('express');

const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.post('/', authenticate, requireAdmin, userController.create);
router.put('/:id', authenticate, requireAdmin, userController.update);
router.patch('/:id/active', authenticate, requireAdmin, userController.setActive);

module.exports = router;
