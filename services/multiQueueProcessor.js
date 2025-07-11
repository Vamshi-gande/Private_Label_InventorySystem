const pool = require('../config/db');
const regionalConsensusEngine = require('../services/regionalConsensusEngineInstance');
const contributionScorer = require('../services/contributionScorer');
const warehouseTransferService = require('../services/warehouseTransferService');
const inventoryLogger = require('../services/inventoryLogger');

async function processQueue(queueName, requests) {
    const results = [];

    for (const request of requests) {
        const { store_id, sku, quantity } = request;

        try {
            const warehouseStock = await pool.query(
                'SELECT available_quantity FROM inventory WHERE product_id = $1 AND warehouse_id = $2',
                [request.product_id, request.warehouse_id]
            );

            const availableQty = warehouseStock.rows[0]?.available_quantity || 0;

            if (availableQty >= quantity) {
                await pool.query(
                    'UPDATE inventory SET available_quantity = available_quantity - $1 WHERE product_id = $2 AND warehouse_id = $3',
                    [quantity, request.product_id, request.warehouse_id]
                );

                inventoryLogger.logAllocationSuccess(store_id, sku, quantity, 'warehouse');
                results.push({ store_id, sku, quantity, source: 'warehouse' });
                continue;
            }

            const contributors = await contributionScorer.findContributors(store_id, sku, quantity);
            if (contributors.length > 0) {
                const best = contributors[0];

                try {
                    const transfer = await warehouseTransferService.createTransferRequest(
                        best.store_id,
                        store_id,
                        sku,
                        quantity,
                        queueName === 'emergency' ? 'emergency' : queueName === 'high_priority_queue' ? 'high' : 'standard'
                    );

                    inventoryLogger.logFallbackTransferInitiated(best.store_id, store_id, sku, quantity, transfer.request_id);
                    results.push({ store_id, sku, quantity, source: 'contributor', via: 'C7', contributor: best.store_id });
                    continue;
                } catch (err) {
                    inventoryLogger.logTransferFailure(best.store_id, store_id, sku, quantity, err.message);
                }
            }

            inventoryLogger.logAllocationFailure(store_id, sku, quantity, 'warehouse + fallback shortfall');
            results.push({ store_id, sku, quantity, source: 'none' });
        } catch (err) {
            console.error('Queue Processing Error:', err);
            inventoryLogger.logSystemError(store_id, sku, quantity, err.message);
        }
    }

    return results;
}

module.exports = {
    async processAllQueues(queues) {
        const emergencyResults = await processQueue('emergency', queues.emergency || []);
        const highPriorityResults = await processQueue('high_priority_queue', queues.high_priority_queue || []);
        const standardResults = await processQueue('standard', queues.standard || []);

        return {
            emergencyResults,
            highPriorityResults,
            standardResults,
            timestamp: new Date().toISOString()
        };
    }
};
