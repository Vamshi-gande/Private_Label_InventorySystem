const pool = require('../config/db');
const consensusEngine = require('../services/regionalConsensusEngineInstance'); // Shared instance
const behaviourAnalyzer = require('../services/behaviourAnalyzer'); // Component 3 signal extractor

exports.runConsensus = async (req, res) => {
    try {
        // Dynamically set consensus threshold (optional)
        const thresholdFromRequest = parseFloat(req.body.consensusThreshold);
        if (!isNaN(thresholdFromRequest)) {
            consensusEngine.consensusThreshold = thresholdFromRequest;
        }

        // Step 1: Fetch store data with valid lat/lng
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
            return res.status(404).json({ success: false, error: 'No stores found with location data.' });
        }

        // Step 2: Fetch recent manager actions (past 7 days)
        const actionsResult = await pool.query(`
            SELECT id, store_id, manager_id, action_type, product_id, quantity, action_timestamp, original_schedule_date
            FROM manager_actions
            WHERE action_timestamp >= NOW() - INTERVAL '7 days'
        `);
        const managerActions = actionsResult.rows;

        if (managerActions.length === 0) {
            return res.status(404).json({ success: false, error: 'No recent manager actions found.' });
        }

        // Step 3: Extract behavioral signals from raw actions
        const extractedSignals = managerActions
            .map(action => {
                const signal = behaviourAnalyzer.extractSignal(action);
                if (signal) {
                    return {
                        store_id: action.store_id,
                        manager_id: action.manager_id,
                        action_type: action.action_type,
                        product_id: action.product_id,
                        timestamp: action.action_timestamp,
                        extracted_intelligence: signal
                    };
                }
                return null;
            })
            .filter(Boolean); // Remove nulls

        if (extractedSignals.length === 0) {
            return res.status(404).json({ success: false, error: 'No valid behavioral signals extracted.' });
        }

        // Step 4: Initialize clustering
        await consensusEngine.initializeRegionalClusters(stores, extractedSignals);

        // Step 5: Validate behavioral consensus
        const consensusReport = await consensusEngine.validateBehavioralSignals(extractedSignals);

        // Optionally cache live signals for Component 5
        consensusEngine._latestExtractedSignals = extractedSignals;

        res.json({
            success: true,
            consensusThreshold: consensusEngine.consensusThreshold,
            report: consensusReport
        });

    } catch (error) {
        console.error('Error in consensus engine:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
