// /routes/queueRoutes.js

const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

router.post('/add', queueController.addRequestToQueue);
router.post('/process', queueController.processQueues);
router.get('/status', queueController.getQueueStatus);
router.post('/load-demo', queueController.loadMockData);
router.get('/demo', queueController.runDemo);

module.exports = router;
