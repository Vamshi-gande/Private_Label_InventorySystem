const warehouseTransferService = require('../services/warehouseTransferService');
const pool = require('../config/db');

class WarehouseTransferController {
    
    // Create a new transfer request
    async createTransferRequest(req, res) {
        try {
            const { fromStoreId, toStoreId, sku, quantity, priority = 'standard' } = req.body;

            // Validate required fields
            if (!fromStoreId || !toStoreId || !sku || !quantity) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: fromStoreId, toStoreId, sku, quantity'
                });
            }

            // Validate priority
            if (!['emergency', 'high', 'standard'].includes(priority)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid priority. Must be: emergency, high, or standard'
                });
            }

            const transferRequest = await warehouseTransferService.createTransferRequest(
                fromStoreId, toStoreId, sku, quantity, priority
            );

            res.status(201).json({
                success: true,
                message: 'Transfer request created successfully',
                data: transferRequest
            });
        } catch (error) {
            console.error('Error creating transfer request:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create transfer request',
                details: error.message
            });
        }
    }

    // Process pending transfers for a warehouse
    async processPendingTransfers(req, res) {
        try {
            const { warehouseId } = req.params;
            const { maxBatchSize = 10 } = req.query;

            const result = await warehouseTransferService.processPendingTransfers(
                parseInt(warehouseId), parseInt(maxBatchSize)
            );

            res.json({
                success: true,
                message: 'Pending transfers processed',
                data: result
            });
        } catch (error) {
            console.error('Error processing pending transfers:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process pending transfers',
                details: error.message
            });
        }
    }

    // Get warehouse status
    async getWarehouseStatus(req, res) {
        try {
            const { warehouseId } = req.params;

            const status = await warehouseTransferService.getWarehouseStatus(
                parseInt(warehouseId)
            );

            if (!status) {
                return res.status(404).json({
                    success: false,
                    error: 'Warehouse not found'
                });
            }

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            console.error('Error getting warehouse status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get warehouse status',
                details: error.message
            });
        }
    }

    // Get all warehouse statuses
    async getAllWarehouseStatuses(req, res) {
        try {
            const statuses = await warehouseTransferService.getAllWarehouseStatuses();

            res.json({
                success: true,
                data: statuses
            });
        } catch (error) {
            console.error('Error getting warehouse statuses:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get warehouse statuses',
                details: error.message
            });
        }
    }

    // Create transfer batch (for manual batch creation)
    async createTransferBatch(req, res) {
        try {
            const { warehouseId, transferRequestIds, scheduledDeparture } = req.body;

            if (!warehouseId || !transferRequestIds || !Array.isArray(transferRequestIds)) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: warehouseId, transferRequestIds (array)'
                });
            }

            const departureDate = scheduledDeparture ? new Date(scheduledDeparture) : new Date(Date.now() + 2 * 60 * 60 * 1000);

            const batch = await warehouseTransferService.createTransferBatch(
                warehouseId, transferRequestIds, departureDate
            );

            res.status(201).json({
                success: true,
                message: 'Transfer batch created successfully',
                data: batch
            });
        } catch (error) {
            console.error('Error creating transfer batch:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create transfer batch',
                details: error.message
            });
        }
    }

    // Demo endpoint to create multiple transfer requests
    async createDemoTransfers(req, res) {
        try {
            const demoRequests = [
                {
                    fromStoreId: 1,
                    toStoreId: 2,
                    sku: 'PL-PASTA-001',
                    quantity: 50,
                    priority: 'high'
                },
                {
                    fromStoreId: 3,
                    toStoreId: 4,
                    sku: 'PL-SAUCE-002',
                    quantity: 30,
                    priority: 'standard'
                },
                {
                    fromStoreId: 2,
                    toStoreId: 1,
                    sku: 'BR-BREAD-001',
                    quantity: 20,
                    priority: 'emergency'
                },
                {
                    fromStoreId: 4,
                    toStoreId: 3,
                    sku: 'PL001',
                    quantity: 25,
                    priority: 'standard'
                }
            ];

            const results = [];
            for (const request of demoRequests) {
                try {
                    const result = await warehouseTransferService.createTransferRequest(
                        request.fromStoreId, request.toStoreId, request.sku, request.quantity, request.priority
                    );
                    results.push(result);
                } catch (error) {
                    console.error('Error creating demo transfer:', error);
                    results.push({ error: error.message, request });
                }
            }

            res.json({
                success: true,
                message: `Created ${results.filter(r => !r.error).length} demo transfer requests`,
                data: results
            });
        } catch (error) {
            console.error('Error creating demo transfers:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create demo transfers',
                details: error.message
            });
        }
    }

    // Get transfer request details
    async getTransferRequest(req, res) {
        try {
            const { requestId } = req.params;

            const client = await pool.connect();
            
            try {
                const result = await client.query(`
                    SELECT tr.*, 
                           s1.store_name as from_store_name,
                           s2.store_name as to_store_name,
                           w.warehouse_name
                    FROM transfer_requests tr
                    JOIN stores s1 ON tr.from_store_id = s1.store_id
                    JOIN stores s2 ON tr.to_store_id = s2.store_id
                    LEFT JOIN warehouses w ON w.warehouse_id = CAST(tr.warehouse_route->>'warehouse_id' AS INTEGER)
                    WHERE tr.request_id = $1
                `, [requestId]);

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Transfer request not found'
                    });
                }

                res.json({
                    success: true,
                    data: result.rows[0]
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error getting transfer request:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get transfer request',
                details: error.message
            });
        }
    }

    // Get all transfer requests with filters
    async getTransferRequests(req, res) {
        try {
            const { status, priority, warehouseId, limit = 50 } = req.query;

            const client = await pool.connect();
            
            try {
                let query = `
                    SELECT tr.*, 
                           s1.store_name as from_store_name,
                           s2.store_name as to_store_name,
                           w.warehouse_name
                    FROM transfer_requests tr
                    JOIN stores s1 ON tr.from_store_id = s1.store_id
                    JOIN stores s2 ON tr.to_store_id = s2.store_id
                    LEFT JOIN warehouses w ON w.warehouse_id = CAST(tr.warehouse_route->>'warehouse_id' AS INTEGER)
                    WHERE 1=1
                `;
                
                const params = [];
                let paramCount = 0;

                if (status) {
                    paramCount++;
                    query += ` AND tr.status = $${paramCount}`;
                    params.push(status);
                }

                if (priority) {
                    paramCount++;
                    query += ` AND tr.priority = $${paramCount}`;
                    params.push(priority);
                }

                if (warehouseId) {
                    paramCount++;
                    query += ` AND tr.warehouse_route->>'warehouse_id' = $${paramCount}`;
                    params.push(warehouseId);
                }

                paramCount++;
                query += ` ORDER BY tr.created_at DESC LIMIT $${paramCount}`;
                params.push(parseInt(limit));

                const result = await client.query(query, params);

                res.json({
                    success: true,
                    data: result.rows,
                    count: result.rows.length
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error getting transfer requests:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get transfer requests',
                details: error.message
            });
        }
    }

    // Update transfer request status
    async updateTransferStatus(req, res) {
        try {
            const { requestId } = req.params;
            const { status, notes } = req.body;

            const validStatuses = ['pending', 'approved', 'warehouse_received', 'in_transit', 'completed', 'failed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            const client = await pool.connect();
            
            try {
                const result = await client.query(`
                    UPDATE transfer_requests 
                    SET status = $1, 
                        notes = COALESCE($2, notes),
                        updated_at = NOW()
                    WHERE request_id = $3
                    RETURNING *
                `, [status, notes, requestId]);

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Transfer request not found'
                    });
                }

                res.json({
                    success: true,
                    message: 'Transfer status updated successfully',
                    data: result.rows[0]
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error updating transfer status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update transfer status',
                details: error.message
            });
        }
    }

    // Get transfer analytics
    async getTransferAnalytics(req, res) {
        try {
            const client = await pool.connect();
            
            try {
                // Get overall transfer statistics
                const statsResult = await client.query(`
                    SELECT 
                        COUNT(*) as total_requests,
                        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
                        COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as in_transit_requests,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
                        COUNT(CASE WHEN priority = 'emergency' THEN 1 END) as emergency_requests,
                        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_requests,
                        AVG(CASE WHEN status = 'completed' THEN 
                            EXTRACT(EPOCH FROM (updated_at - created_at))/3600 
                        END) as avg_completion_time_hours,
                        SUM(estimated_cost) as total_estimated_cost
                    FROM transfer_requests
                    WHERE created_at >= NOW() - INTERVAL '7 days'
                `);

                // Get warehouse efficiency
                const warehouseResult = await client.query(`
                    SELECT 
                        w.warehouse_name,
                        w.warehouse_id,
                        COUNT(*) as requests_handled,
                        AVG(CASE WHEN tr.status = 'completed' THEN 
                            EXTRACT(EPOCH FROM (tr.updated_at - tr.created_at))/3600 
                        END) as avg_processing_time_hours,
                        COUNT(CASE WHEN tr.status = 'completed' THEN 1 END) as completed_transfers,
                        SUM(tr.estimated_cost) as total_cost
                    FROM transfer_requests tr
                    JOIN warehouses w ON w.warehouse_id = CAST(tr.warehouse_route->>'warehouse_id' AS INTEGER)
                    WHERE tr.created_at >= NOW() - INTERVAL '7 days'
                    GROUP BY w.warehouse_id, w.warehouse_name
                    ORDER BY requests_handled DESC
                `);

                res.json({
                    success: true,
                    data: {
                        overall_stats: statsResult.rows[0],
                        warehouse_performance: warehouseResult.rows
                    }
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error getting transfer analytics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get transfer analytics',
                details: error.message
            });
        }
    }

    // Emergency transfer override (for critical stockouts)
    async createEmergencyTransfer(req, res) {
        try {
            const { fromStoreId, toStoreId, sku, quantity, reason } = req.body;

            if (!fromStoreId || !toStoreId || !sku || !quantity || !reason) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: fromStoreId, toStoreId, sku, quantity, reason'
                });
            }

            // Create emergency transfer with highest priority
            const transferRequest = await warehouseTransferService.createTransferRequest(
                fromStoreId, toStoreId, sku, quantity, 'emergency'
            );

            // Update with emergency reason
            const client = await pool.connect();
            
            try {
                await client.query(`
                    UPDATE transfer_requests 
                    SET notes = $1, emergency_reason = $2
                    WHERE request_id = $3
                `, [`Emergency transfer: ${reason}`, reason, transferRequest.request_id]);
            } finally {
                client.release();
            }

            res.status(201).json({
                success: true,
                message: 'Emergency transfer created successfully',
                data: transferRequest
            });
        } catch (error) {
            console.error('Error creating emergency transfer:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create emergency transfer',
                details: error.message
            });
        }
    }

    // Batch process transfers by priority (for automated scheduling)
    async processPriorityTransfers(req, res) {
        try {
            const { priority = 'high', maxBatches = 3 } = req.query;

            const client = await pool.connect();
            
            try {
                // Get pending transfers by priority
                const pendingResult = await client.query(`
                    SELECT DISTINCT CAST(warehouse_route->>'warehouse_id' AS INTEGER) as warehouse_id
                    FROM transfer_requests
                    WHERE status = 'pending' AND priority = $1
                `, [priority]);

                const processedBatches = [];
                
                for (const row of pendingResult.rows.slice(0, maxBatches)) {
                    const result = await warehouseTransferService.processPendingTransfers(
                        row.warehouse_id, 10
                    );
                    processedBatches.push(result);
                }

                res.json({
                    success: true,
                    message: `Processed ${processedBatches.length} priority batches`,
                    data: processedBatches
                });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error processing priority transfers:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process priority transfers',
                details: error.message
            });
        }
    }
}

module.exports = new WarehouseTransferController();
