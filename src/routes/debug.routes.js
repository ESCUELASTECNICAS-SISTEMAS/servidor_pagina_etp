const express = require('express');
const router = express.Router();
const controller = require('../controllers/debug.controller');

router.get('/mail', controller.mail);

module.exports = router;
