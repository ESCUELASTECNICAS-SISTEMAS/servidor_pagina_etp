const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');

router.get('/', mediaController.list);
router.get('/:id', mediaController.getById);
router.post('/', mediaController.create);
router.put('/:id', mediaController.update);
router.delete('/:id', mediaController.remove);

module.exports = router;
