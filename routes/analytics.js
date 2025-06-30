const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/private-label-comparison', analyticsController.privateLabelComparison);

module.exports = router;
