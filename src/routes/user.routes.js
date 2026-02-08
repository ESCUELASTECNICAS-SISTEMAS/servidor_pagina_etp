const express = require('express');

const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.patch('/:id/active', userController.setActive);

module.exports = router;
