const express = require('express');
const router = express.Router();
const warehouseTransferController = require('../controllers/warehouseTransferController');

// ==================== TRANSFER REQUEST ROUTES ====================

// Create a new transfer request
router.post('/requests', warehouseTransferController.createTransferRequest);

// Get all transfer requests with filters
router.get('/requests', warehouseTransferController.getTransferRequests);

// Get specific transfer request
router.get('/requests/:requestId', warehouseTransferController.getTransferRequest);

// Update transfer request status
router.put('/requests/:requestId/status', warehouseTransferController.updateTransferStatus);

// Create emergency transfer (high priority)
router.post('/requests/emergency', warehouseTransferController.createEmergencyTransfer);

// ==================== WAREHOUSE MANAGEMENT ROUTES ====================

// Get all warehouse statuses
router.get('/warehouses/status', warehouseTransferController.getAllWarehouseStatuses);

// Get specific warehouse status
router.get('/warehouses/:warehouseId/status', warehouseTransferController.getWarehouseStatus);

// Process pending transfers for a warehouse
router.post('/warehouses/:warehouseId/process', warehouseTransferController.processPendingTransfers);

// Process transfers by priority across all warehouses
router.post('/process/priority', warehouseTransferController.processPriorityTransfers);

// ==================== BATCH MANAGEMENT ROUTES ====================

// Create transfer batch manually
router.post('/batches', warehouseTransferController.createTransferBatch);

// ==================== ANALYTICS & REPORTING ROUTES ====================

// Get transfer analytics
router.get('/analytics', warehouseTransferController.getTransferAnalytics);

// ==================== DEMO & TESTING ROUTES ====================

// Create demo transfer requests for testing
router.post('/demo/create-transfers', warehouseTransferController.createDemoTransfers);

module.exports = router;
