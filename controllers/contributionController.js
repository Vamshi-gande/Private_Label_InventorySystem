const contributionScorer = require('../services/contributionScorer');
const pool = require('../config/db');

exports.getContributionScore = async (req, res) => {
    try {
        const { fromStore, toStore, sku } = req.params;
        const score = await contributionScorer.calculateContributionScore(
            parseInt(fromStore), 
            sku, 
            parseInt(toStore)
        );
        
        res.json({
            success: true,
            from_store: fromStore,
            to_store: toStore,
            sku: sku,
            contribution_score: score,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getContributionScore:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

exports.findContributors = async (req, res) => {
    try {
        const { requesting_store_id, sku, needed_quantity } = req.body;
        
        if (!requesting_store_id || !sku || !needed_quantity) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: requesting_store_id, sku, needed_quantity'
            });
        }
        
        const contributors = await contributionScorer.findContributors(
            parseInt(requesting_store_id),
            sku,
            parseInt(needed_quantity)
        );
        
        const totalAvailable = contributors.reduce((sum, c) => sum + c.available_to_contribute, 0);
        
        res.json({
            success: true,
            requesting_store: requesting_store_id,
            sku: sku,
            needed_quantity: needed_quantity,
            contributors: contributors,
            total_available: totalAvailable,
            fulfillment_possible: totalAvailable >= needed_quantity,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in findContributors:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

exports.batchContributionAnalysis = async (req, res) => {
    try {
        const { requests } = req.body;
        
        if (!requests || !Array.isArray(requests)) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid requests array'
            });
        }
        
        const results = await contributionScorer.batchContributionAnalysis(requests);
        
        res.json({
            success: true,
            batch_results: results,
            total_requests: requests.length,
            fulfillable_requests: results.filter(r => r.fulfillment_possible).length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in batchContributionAnalysis:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

exports.getContributionHistory = async (req, res) => {
    try {
        const { storeId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        
        const query = `
            SELECT ch.*, s1.store_name as from_store_name, s2.store_name as to_store_name
            FROM contribution_history ch
            JOIN stores s1 ON ch.from_store_id = s1.store_id
            JOIN stores s2 ON ch.to_store_id = s2.store_id
            WHERE ch.from_store_id = $1 OR ch.to_store_id = $1
            ORDER BY ch.created_at DESC
            LIMIT $2
        `;
        
        const result = await pool.query(query, [parseInt(storeId), limit]);
        
        res.json({
            success: true,
            store_id: storeId,
            history: result.rows,
            count: result.rows.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getContributionHistory:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

exports.recordContribution = async (req, res) => {
    try {
        const { from_store_id, to_store_id, sku, contribution_score, quantity_contributed, transfer_success } = req.body;
        
        const contributionId = await contributionScorer.recordContribution(
            parseInt(from_store_id),
            parseInt(to_store_id),
            sku,
            parseFloat(contribution_score),
            parseInt(quantity_contributed),
            transfer_success !== false // Default to true if not specified
        );
        
        res.json({
            success: true,
            contribution_id: contributionId,
            message: 'Contribution recorded successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in recordContribution:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

exports.getStoreInventory = async (req, res) => {
    try {
        const { storeId } = req.params;
        
        const query = `
            SELECT si.*, p.product_name, p.is_private_label, p.sku
            FROM store_inventory si
            JOIN products p ON si.product_id = p.product_id
            WHERE si.store_id = $1
            ORDER BY si.current_stock DESC
        `;
        
        const result = await pool.query(query, [parseInt(storeId)]);
        
        res.json({
            success: true,
            store_id: storeId,
            inventory: result.rows,
            total_items: result.rows.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getStoreInventory:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};