const express = require('express');
const router = express.Router();
const consensusController = require('../controllers/consensusController');

router.post('/run', consensusController.runConsensus);

module.exports = router;
