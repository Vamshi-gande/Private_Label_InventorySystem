const express = require('express');
const router = express.Router();
const managerActionsController = require('../controllers/managerActionsController');

router.post('/', managerActionsController.logAction);
router.get('/signals', managerActionsController.getSignals);

module.exports = router;
