const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tip.controller');

router.get('/', tipController.list);
router.get('/slug/:slug', tipController.getBySlug);
router.get('/:id', tipController.getById);
router.post('/', tipController.create);
router.put('/:id', tipController.update);
router.delete('/:id', tipController.remove);

module.exports = router;
