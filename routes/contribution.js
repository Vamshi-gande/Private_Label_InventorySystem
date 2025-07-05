const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');

// Get contribution score between two stores for a specific SKU
router.get('/score/:fromStore/:toStore/:sku', contributionController.getContributionScore);

// Find all potential contributors for a requesting store
router.post('/find-contributors', contributionController.findContributors);

// Batch contribution analysis for multiple requests
router.post('/batch-analysis', contributionController.batchContributionAnalysis);

// Get contribution history for a store (using query parameter for limit)
router.get('/history/:storeId', contributionController.getContributionHistory);

// Record a contribution transaction
router.post('/record', contributionController.recordContribution);

// Get store inventory
router.get('/store-inventory/:storeId', contributionController.getStoreInventory);

module.exports = router;