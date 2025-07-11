    const express = require('express');
    const router = express.Router();
    const diagnosticsController = require('../controllers/diagnosticsController');

    router.get('/clusters/private-label', diagnosticsController.getPrivateLabelClusterInsights);

    module.exports = router;
