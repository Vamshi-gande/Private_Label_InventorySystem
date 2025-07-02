const pool = require('../config/db');
const RegionalConsensusEngine = require('../services/regionalConsensusEngine');
const behaviourAnalyzer = require('../services/behaviourAnalyzer');  // Your Component-3 extractor

exports.runConsensus = async (req, res) => {
    try {
        // ✅ Support dynamic threshold from API request
        const thresholdFromRequest = parseFloat(req.body.consensusThreshold);
        const consensusThreshold = !isNaN(thresholdFromRequest) ? thresholdFromRequest : 0.4;

        // ✅ Pass threshold to the engine
        const consensusEngine = new RegionalConsensusEngine(consensusThreshold);

        // ✅ Fetch store locations
        const storesResult = await pool.query(`SELECT store_id, latitude, longitude FROM stores WHERE latitude IS NOT NULL AND longitude IS NOT NULL`);
        const stores = storesResult.rows.map(store => ({
            store_id: store.store_id,
            location: { lat: parseFloat(store.latitude), lng: parseFloat(store.longitude) }
        }));

        if (stores.length === 0) {
            return res.status(404).json({ success: false, error: 'No stores found with location data.' });
        }

        // ✅ Fetch manager actions (raw)
        const actionsResult = await pool.query(`
            SELECT id, store_id, manager_id, action_type, product_id, quantity, action_timestamp, original_schedule_date
            FROM manager_actions
            WHERE action_timestamp >= NOW() - INTERVAL '7 days'
        `);
        const managerActions = actionsResult.rows;

        if (managerActions.length === 0) {
            return res.status(404).json({ success: false, error: 'No recent manager actions found.' });
        }

        // ✅ Extract signals dynamically using behaviourAnalyzer
        const extractedSignals = managerActions
            .map(action => {
                const signal = behaviourAnalyzer.extractSignal(action);
                if (signal) {
                    return {
                        store_id: action.store_id,
                        manager_id: action.manager_id,
                        action_type: action.action_type,
                        timestamp: action.action_timestamp,
                        extracted_intelligence: signal
                    };
                }
                return null;
            })
            .filter(Boolean);  // Remove nulls

        if (extractedSignals.length === 0) {
            return res.status(404).json({ success: false, error: 'No valid signals extracted.' });
        }

        // ✅ Initialize clusters
        await consensusEngine.initializeRegionalClusters(stores, extractedSignals);

        // ✅ Run consensus validation
        const consensusReport = await consensusEngine.validateBehavioralSignals(extractedSignals);

        res.json({ success: true, consensusThreshold, report: consensusReport });

    } catch (error) {
        console.error('Error running regional consensus:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
