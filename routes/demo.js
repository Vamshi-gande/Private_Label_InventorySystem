const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');

router.post('/concurrent-reservations', demoController.concurrentReservations);

module.exports = router;
