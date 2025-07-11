const clusterManagerService = require('../services/clusterManagerService');

exports.getPrivateLabelClusterInsights = async (req, res) => {
    try {
        const clusters = await clusterManagerService.getClusters(); // should return enriched clusters
        const privateLabelInsights = clusters.map(c => ({
            cluster_id: c.id,
            store_count: c.stores.length,
            privateLabelRatio: c.privateLabelRatio || 0,
            averagePrivateLabelPriority: c.averagePrivateLabelPriority || 0,
            performance_score: c.performance_score || 0
        }));
        res.json({
            success: true,
            diagnostics: privateLabelInsights
        });
    } catch (error) {
        console.error('Diagnostics error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
