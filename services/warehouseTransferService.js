const pool = require('../config/db');

class WarehouseTransferService {
    constructor() {
        this.failoverHierarchy = [
            { level: 1, capacity: 1.0, name: 'Primary' },
            { level: 2, capacity: 0.6, name: 'Secondary' },
            { level: 3, capacity: 0.3, name: 'Emergency' }
        ];
    }

    // Create transfer request with warehouse routing
    async createTransferRequest(fromStoreId, toStoreId, sku, quantity, priority = 'standard') {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Generate unique request ID
            const requestId = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Find optimal warehouse route
            const warehouseRoute = await this.findOptimalWarehouseRoute(
                fromStoreId, toStoreId, quantity, priority, client
            );

            if (!warehouseRoute) {
                throw new Error('No available warehouse route found for this transfer');
            }

            // Calculate estimated cost
            const estimatedCost = await this.calculateTransferCost(
                warehouseRoute, quantity, priority, client
            );

            // Insert transfer request
            const result = await client.query(`
                INSERT INTO transfer_requests 
                (request_id, from_store_id, to_store_id, sku, quantity, priority, warehouse_route, estimated_cost)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [requestId, fromStoreId, toStoreId, sku, quantity, priority, JSON.stringify(warehouseRoute), estimatedCost]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Find optimal warehouse route with failover
    async findOptimalWarehouseRoute(fromStoreId, toStoreId, quantity, priority, client) {
        // Get store locations and available warehouses
        const storeQuery = await client.query(`
            SELECT s.store_id, s.store_name, s.latitude, s.longitude
            FROM stores s
            WHERE s.store_id IN ($1, $2)
        `, [fromStoreId, toStoreId]);

        const warehouseQuery = await client.query(`
            SELECT w.warehouse_id, w.warehouse_name, w.latitude, w.longitude, w.region
            FROM warehouses w
            ORDER BY w.warehouse_id
        `);

        if (storeQuery.rows.length !== 2 || warehouseQuery.rows.length === 0) {
            throw new Error('Unable to find store or warehouse data');
        }

        const fromStore = storeQuery.rows.find(s => s.store_id == fromStoreId);
        const toStore = storeQuery.rows.find(s => s.store_id == toStoreId);
        const warehouses = warehouseQuery.rows;

        let bestRoute = null;
        let bestScore = -1;

        for (const warehouse of warehouses) {
            // Check warehouse capacity
            const capacity = await this.checkWarehouseCapacity(warehouse.warehouse_id, quantity, client);
            if (!capacity.available) continue;

            // Calculate distance score
            const distanceFromSource = this.calculateDistance(
                fromStore.latitude, fromStore.longitude,
                warehouse.latitude, warehouse.longitude
            );
            const distanceToDestination = this.calculateDistance(
                warehouse.latitude, warehouse.longitude,
                toStore.latitude, toStore.longitude
            );

            const totalDistance = distanceFromSource + distanceToDestination;
            
            // Capacity score (higher available capacity = better score)
            const capacityScore = capacity.utilization_percentage < 80 ? 1.0 : 0.5;
            
            // Priority multiplier
            const priorityMultiplier = priority === 'emergency' ? 2.0 : priority === 'high' ? 1.5 : 1.0;
            
            // Regional preference (same region gets bonus)
            const regionalBonus = (warehouse.region === fromStore.region || warehouse.region === toStore.region) ? 1.2 : 1.0;

            // Composite score (lower distance is better, higher capacity is better)
            const score = (capacityScore * priorityMultiplier * regionalBonus) / (totalDistance / 100);

            if (score > bestScore) {
                bestScore = score;
                bestRoute = {
                    warehouse_id: warehouse.warehouse_id,
                    warehouse_name: warehouse.warehouse_name,
                    distance_from_source: Math.round(distanceFromSource * 100) / 100,
                    distance_to_destination: Math.round(distanceToDestination * 100) / 100,
                    total_distance: Math.round(totalDistance * 100) / 100,
                    capacity_available: capacity.available_capacity,
                    score: Math.round(score * 100) / 100,
                    priority: priority,
                    region: warehouse.region
                };
            }
        }

        return bestRoute;
    }

    // Check warehouse capacity
    async checkWarehouseCapacity(warehouseId, requiredQuantity, client) {
        const capacityQuery = await client.query(`
            SELECT wc.max_capacity, wc.current_utilization, wc.incoming_scheduled,
                   (wc.max_capacity - wc.current_utilization - wc.incoming_scheduled) as available_capacity
            FROM warehouse_capacity wc
            WHERE wc.warehouse_id = $1 AND wc.date = CURRENT_DATE
        `, [warehouseId]);

        if (capacityQuery.rows.length === 0) {
            // Create default capacity if not exists
            await client.query(`
                INSERT INTO warehouse_capacity (warehouse_id, date, max_capacity, current_utilization)
                VALUES ($1, CURRENT_DATE, $2, $3)
            `, [warehouseId, 500, 50]); // Default values

            return { available: true, available_capacity: 450, utilization_percentage: 10 };
        }

        const capacity = capacityQuery.rows[0];
        return {
            available: capacity.available_capacity >= requiredQuantity,
            available_capacity: capacity.available_capacity,
            utilization_percentage: Math.round((capacity.current_utilization / capacity.max_capacity) * 100)
        };
    }

    // Calculate transfer cost
    async calculateTransferCost(warehouseRoute, quantity, priority, client) {
        if (!warehouseRoute) return 0;

        // Base cost per km per unit
        const baseCostPerKmPerUnit = 0.05;
        const priorityMultiplier = priority === 'emergency' ? 2.0 : priority === 'high' ? 1.5 : 1.0;
        const distanceMultiplier = warehouseRoute.total_distance > 100 ? 1.2 : 1.0;

        return Math.round(warehouseRoute.total_distance * quantity * baseCostPerKmPerUnit * priorityMultiplier * distanceMultiplier * 100) / 100;
    }

    // Calculate distance between two points (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 1000; // Default high distance if coordinates missing
        
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Create transfer batch
    async createTransferBatch(warehouseId, transferRequestIds, scheduledDeparture) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Generate batch ID
            const batchId = `TB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Calculate total cost
            const costQuery = await client.query(`
                SELECT SUM(estimated_cost) as total_cost, COUNT(*) as request_count
                FROM transfer_requests
                WHERE id = ANY($1)
            `, [transferRequestIds]);

            const { total_cost, request_count } = costQuery.rows[0];

            // Create batch
            const batchResult = await client.query(`
                INSERT INTO transfer_batches 
                (batch_id, warehouse_id, total_requests, total_cost, scheduled_departure)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [batchId, warehouseId, request_count, total_cost, scheduledDeparture]);

            const batch = batchResult.rows[0];

            // Add items to batch
            for (const requestId of transferRequestIds) {
                await client.query(`
                    INSERT INTO transfer_batch_items (batch_id, transfer_request_id)
                    VALUES ($1, $2)
                `, [batch.id, requestId]);

                // Update transfer request status
                await client.query(`
                    UPDATE transfer_requests 
                    SET status = 'approved', updated_at = CURRENT_TIMESTAMP
                    WHERE id = $1
                `, [requestId]);
            }

            await client.query('COMMIT');
            return batch;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Process pending transfers (batch coordination)
    async processPendingTransfers(warehouseId, maxBatchSize = 10) {
        const client = await pool.connect();
        try {
            // Get pending transfers for this warehouse
            const pendingQuery = await client.query(`
                SELECT tr.*, s1.store_name as from_store_name, s2.store_name as to_store_name
                FROM transfer_requests tr
                JOIN stores s1 ON tr.from_store_id = s1.store_id
                JOIN stores s2 ON tr.to_store_id = s2.store_id
                WHERE tr.status = 'pending' 
                AND tr.warehouse_route->>'warehouse_id' = $1
                ORDER BY 
                    CASE tr.priority 
                        WHEN 'emergency' THEN 1
                        WHEN 'high' THEN 2
                        ELSE 3
                    END,
                    tr.created_at
                LIMIT $2
            `, [warehouseId.toString(), maxBatchSize]);

            if (pendingQuery.rows.length === 0) {
                return { message: 'No pending transfers found' };
            }

            // Group by priority and create batches
            const emergencyRequests = pendingQuery.rows.filter(r => r.priority === 'emergency');
            const highRequests = pendingQuery.rows.filter(r => r.priority === 'high');
            const standardRequests = pendingQuery.rows.filter(r => r.priority === 'standard');

            const batches = [];

            // Process emergency requests immediately
            if (emergencyRequests.length > 0) {
                const emergencyBatch = await this.createTransferBatch(
                    warehouseId,
                    emergencyRequests.map(r => r.id),
                    new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
                );
                batches.push(emergencyBatch);
            }

            // Process high priority requests
            if (highRequests.length > 0) {
                const highBatch = await this.createTransferBatch(
                    warehouseId,
                    highRequests.map(r => r.id),
                    new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
                );
                batches.push(highBatch);
            }

            // Process standard requests
            if (standardRequests.length > 0) {
                const standardBatch = await this.createTransferBatch(
                    warehouseId,
                    standardRequests.map(r => r.id),
                    new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
                );
                batches.push(standardBatch);
            }

            return {
                batches_created: batches.length,
                batches: batches,
                total_requests_processed: pendingQuery.rows.length
            };
        } finally {
            client.release();
        }
    }

    // Get warehouse status
    async getWarehouseStatus(warehouseId) {
        const client = await pool.connect();
        try {
            const statusQuery = await client.query(`
                SELECT 
                    w.warehouse_id, w.warehouse_name, w.region,
                    COALESCE(wc.max_capacity, 500) as max_capacity,
                    COALESCE(wc.current_utilization, 0) as current_utilization,
                    COALESCE(wc.incoming_scheduled, 0) as incoming_scheduled,
                    COALESCE(wc.max_capacity - wc.current_utilization - wc.incoming_scheduled, 500) as available_capacity,
                    ROUND((COALESCE(wc.current_utilization, 0)::decimal / COALESCE(wc.max_capacity, 500)) * 100, 2) as utilization_percentage,
                    COUNT(DISTINCT tb.id) as active_batches,
                    COUNT(DISTINCT tr.id) as pending_transfers
                FROM warehouses w
                LEFT JOIN warehouse_capacity wc ON w.warehouse_id = wc.warehouse_id AND wc.date = CURRENT_DATE
                LEFT JOIN transfer_batches tb ON w.warehouse_id = tb.warehouse_id AND tb.status IN ('preparing', 'ready', 'in_transit')
                LEFT JOIN transfer_requests tr ON tr.warehouse_route->>'warehouse_id' = w.warehouse_id::text AND tr.status = 'pending'
                WHERE w.warehouse_id = $1
                GROUP BY w.warehouse_id, w.warehouse_name, w.region, wc.max_capacity, wc.current_utilization, wc.incoming_scheduled
            `, [warehouseId]);

            return statusQuery.rows[0] || null;
        } finally {
            client.release();
        }
    }

    // Get all warehouse statuses
    async getAllWarehouseStatuses() {
        const client = await pool.connect();
        try {
            const statusQuery = await client.query(`
                SELECT 
                    w.warehouse_id, w.warehouse_name, w.region,
                    COALESCE(wc.max_capacity, 500) as max_capacity,
                    COALESCE(wc.current_utilization, 0) as current_utilization,
                    COALESCE(wc.incoming_scheduled, 0) as incoming_scheduled,
                    COALESCE(wc.max_capacity - wc.current_utilization - wc.incoming_scheduled, 500) as available_capacity,
                    ROUND((COALESCE(wc.current_utilization, 0)::decimal / COALESCE(wc.max_capacity, 500)) * 100, 2) as utilization_percentage,
                    COUNT(DISTINCT tb.id) as active_batches,
                    COUNT(DISTINCT tr.id) as pending_transfers
                FROM warehouses w
                LEFT JOIN warehouse_capacity wc ON w.warehouse_id = wc.warehouse_id AND wc.date = CURRENT_DATE
                LEFT JOIN transfer_batches tb ON w.warehouse_id = tb.warehouse_id AND tb.status IN ('preparing', 'ready', 'in_transit')
                LEFT JOIN transfer_requests tr ON tr.warehouse_route->>'warehouse_id' = w.warehouse_id::text AND tr.status = 'pending'
                GROUP BY w.warehouse_id, w.warehouse_name, w.region, wc.max_capacity, wc.current_utilization, wc.incoming_scheduled
                ORDER BY w.warehouse_id
            `);

            return statusQuery.rows;
        } finally {
            client.release();
        }
    }

    async getSimpleWarehouseStatus(warehouseId) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT max_capacity, current_utilization,
                    ROUND((current_utilization::decimal / NULLIF(max_capacity, 0)) * 100, 2) AS utilization_percentage
                    FROM warehouse_capacity
                    WHERE warehouse_id = $1 AND date = CURRENT_DATE
                `, [warehouseId]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    async getRouteCost(storeId, warehouseId) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM transfer_routes
                WHERE to_store_id = $1 AND from_warehouse_id = $2 AND active = true
                LIMIT 1
            `, [storeId, warehouseId]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }
}

module.exports = new WarehouseTransferService();
