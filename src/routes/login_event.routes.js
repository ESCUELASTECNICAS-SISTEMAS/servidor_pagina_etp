const express = require('express');
const router = express.Router();
const controller = require('../controllers/login_event.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// list events (admin)
router.get('/', authenticate, requireAdmin, controller.list);

// stats: optional query params `from=YYYY-MM-DD&to=YYYY-MM-DD`
router.get('/stats', authenticate, requireAdmin, controller.stats);

module.exports = router;
