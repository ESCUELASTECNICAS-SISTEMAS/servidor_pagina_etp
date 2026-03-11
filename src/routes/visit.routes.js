const express = require('express');
const router = express.Router();
const controller = require('../controllers/visit.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.post('/', controller.createVisit);
router.get('/stats', authenticate, requireAdmin, controller.stats);

module.exports = router;
