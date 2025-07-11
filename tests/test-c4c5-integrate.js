require('dotenv').config();
const pool = require('../config/db');
const consensusEngine = require('../services/regionalConsensusEngineInstance');
const queueProcessor = require('../services/multiQueueProcessor');

async function runTest() {
    try {
        console.log('🔄 Step 1: Fetching stores...');
        const storesResult = await pool.query(`
            SELECT store_id, latitude, longitude
            FROM stores
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        `);

        const stores = storesResult.rows.map(store => ({
            store_id: store.store_id,
            location: { lat: parseFloat(store.latitude), lng: parseFloat(store.longitude) }
        }));

        if (stores.length === 0) {
            console.warn('⚠️ No stores with location data');
            return;
        }

        console.log('✅ Stores loaded:', stores.length);

        console.log('🔄 Step 2: Fetching manager actions...');
        const actionsResult = await pool.query(`
            SELECT id, store_id, manager_id, action_type, product_id, quantity, action_timestamp, original_schedule_date
            FROM manager_actions
            WHERE action_timestamp >= NOW() - INTERVAL '7 days'
        `);

        const managerActions = actionsResult.rows.map(action => ({
            store_id: action.store_id,
            manager_id: action.manager_id,
            action_type: action.action_type,
            product_id: action.product_id,
            timestamp: action.action_timestamp,
            extracted_intelligence: {
                signal: action.action_type === 'safety_stock_increase' ? 'volatility_expected' : null,
                confidence: 0.8
            }
        }));

        if (managerActions.length === 0) {
            console.warn('⚠️ No manager actions found');
            return;
        }

        console.log('✅ Manager actions loaded:', managerActions.length);

        console.log('🔄 Step 3: Initializing Regional Clusters...');
        await consensusEngine.initializeRegionalClusters(stores, managerActions);

        console.log('🔄 Step 4: Running Consensus Validation...');
        const consensusReport = await consensusEngine.validateBehavioralSignals(managerActions);

        console.log('✅ Consensus Report Generated');
        console.log(JSON.stringify(consensusReport, null, 2));

        console.log('🔄 Step 5: Simulating Queue Request...');
        const testRequest = {
            store_id: stores[0].store_id,
            sku: 'PL-PASTA-001',
            quantity_needed: 50,
            urgency: 'normal',
            priority_level: 'standard'
        };

        const queueType = await queueProcessor.addToQueue(testRequest);
        console.log(`✅ Request assigned to queue: ${queueType}`);

        console.log('🔄 Step 6: Processing Queues...');
        const results = await queueProcessor.processAllQueues();
        console.log('✅ Queues processed. Results:\n', JSON.stringify(results, null, 2));

        console.log('\n✅ Integration test for C4 → C5 completed successfully.');
    } catch (error) {
        console.error('❌ Error during integration test:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

runTest();
