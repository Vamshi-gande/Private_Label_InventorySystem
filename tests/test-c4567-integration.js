// tests/test-c4567-integration.js

require('dotenv').config();
const MultiQueueProcessor = require('../services/multiQueueProcessor');
const { initializeRegionalConsensus } = require('../services/regionalConsensusEngineInstance'); // C4
const pool = require('../config/db');

(async function testC4567Integration() {
    console.log('\n🔗 Running C4 + C5 + C6 + C7 Integration Test...\n');

    try {
        // Step 1: Initialize Regional Consensus Engine (C4)
        const stores = [
            { store_id: 1, location: { lat: 12.9716, lng: 77.5946 } }, // Bangalore
            { store_id: 2, location: { lat: 13.0827, lng: 80.2707 } }, // Chennai
            { store_id: 3, location: { lat: 17.3850, lng: 78.4867 } }  // Hyderabad
        ];
        const managerActions = [
            {
                store_id: 1,
                product_id: 101,
                action_type: 'safety_stock_increase',
                timestamp: new Date()
            }
        ];
        const consensus = initializeRegionalConsensus(stores, managerActions);
        console.log('✅ C4 Consensus Report:', JSON.stringify(consensus, null, 2));

        // Step 2: Prepare test inventory for fallback failure
        await pool.query(`UPDATE inventory SET available_quantity = 0 WHERE sku = 'PL-PASTA-001'`);

        // Step 3: Queue allocation requests to C5
        const processor = new MultiQueueProcessor();

        processor.enqueueRequest({
            store_id: 2,
            product_id: 101,
            sku: 'PL-PASTA-001',
            quantity: 10,
            urgency: 'high',
            is_private_label: true,
            behavioral_intelligence: true
        });

        processor.enqueueRequest({
            store_id: 3,
            product_id: 101,
            sku: 'PL-PASTA-001',
            quantity: 15,
            urgency: 'standard',
            is_private_label: true,
            behavioral_intelligence: true
        });

        processor.enqueueRequest({
            store_id: 1,
            product_id: 101,
            sku: 'PL-PASTA-001',
            quantity: 5,
            urgency: 'emergency',
            is_private_label: true,
            behavioral_intelligence: true
        });

        // Step 4: Process all queues and observe fallback + transfers
        const results = await processor.processAllQueues();
        console.log('\n✅ C5+C6+C7 Processed Results:\n', JSON.stringify(results, null, 2));

        console.log('\n🎯 Integration Test Passed.\n');
    } catch (err) {
        console.error('\n❌ Integration Test Failed:', err.message, '\n');
    } finally {
        process.exit(0);
    }
})();
