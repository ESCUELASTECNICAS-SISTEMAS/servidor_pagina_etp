const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');

router.get('/', socialController.list);
router.get('/:id', socialController.getById);
router.post('/', socialController.create);
router.put('/:id', socialController.update);
router.delete('/:id', socialController.remove);

module.exports = router;
