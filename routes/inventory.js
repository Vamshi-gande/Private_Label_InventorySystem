const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/:productId', inventoryController.getInventoryStatus);

module.exports = router;
