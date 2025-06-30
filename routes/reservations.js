const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservationsController');

router.post('/', reservationsController.createReservation);
router.get('/active', reservationsController.getActiveReservations);
router.post('/cleanup', reservationsController.cleanupExpiredReservations);

module.exports = router;
