const express = require('express');
const router = express.Router();
const clusterManagerController = require('../controllers/clusterManagerController');

// Get all clusters
router.get('/', clusterManagerController.getClusters);

// Health check
router.get('/health', clusterManagerController.healthCheck);

// Initialize clusters
router.post('/clusters/initialize', clusterManagerController.initializeClusters);

// Get all clusters
router.get('/clusters', clusterManagerController.getClusters);

// Get specific cluster by ID
router.get('/clusters/:clusterId', clusterManagerController.getClusterById);

// get clustermanager performance
router.get('/clusters/performance', clusterManagerController.getClusterPerformanceMetrics);

router.post('/optimize', clusterManagerController.optimizeBoundaries);

router.post('/evaluate-transfer', clusterManagerController.evaluateTransfer);

module.exports = router;
