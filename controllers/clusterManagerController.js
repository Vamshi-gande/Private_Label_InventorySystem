const clusterManagerService = require('../services/clusterManagerService');
const pool = require('../config/db');

class ClusterManagerController {
    // Initialize geographic clusters
    async initializeClusters(req, res) {
        try {
            const { targetClusters = 4 } = req.body;
            const clusters = await clusterManagerService.createGeographicClusters(targetClusters);
            res.status(200).json({
                success: true,
                message: `Created ${clusters.length} geographic clusters`,
                clusters
            });
        } catch (error) {
            console.error('Error initializing clusters:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to initialize clusters',
                details: error.message
            });
        }
    }

    // Get all clusters
    async getClusters(req, res) {
        try {
            const clusters = clusterManagerService.getClusters();
            res.json({
                success: true,
                total_clusters: clusters.length,
                clusters
            });
        } catch (error) {
            console.error('Error fetching clusters:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch clusters',
                details: error.message
            });
        }
    }

    // Get specific cluster by ID
    async getClusterById(req, res) {
        try {
            const { clusterId } = req.params;
            const cluster = clusterManagerService.getClusterById(clusterId);
            if (!cluster) {
                return res.status(404).json({
                    success: false,
                    error: 'Cluster not found'
                });
            }
            res.json({
                success: true,
                cluster
            });
        } catch (error) {
            console.error('Error fetching cluster by ID:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch cluster',
                details: error.message
            });
        }
    }

    // Health check endpoint
    async healthCheck(req, res) {
        try {
            res.json({
                status: 'healthy',
                component: 'Regional Cluster Manager',
                clusters_active: clusterManagerService.getClusters().length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                status: 'unhealthy',
                error: error.message
            });
        }
    }

    // Get performance metrics with efficiency rating
    async getClusterPerformanceMetrics(req, res) {
        try {
            const clusters = await clusterManagerService.getClusters();
            const performanceMetrics = clusters.map(cluster => {
                const storeCount = cluster.stores.length || 0;
                const totalRevenue = cluster.total_revenue || 0;
                const avgTransferCost = cluster.avg_transfer_cost || 0;
                const performanceScore = totalRevenue / (avgTransferCost + 1); // avoid divide by 0

                return {
                    cluster_id: cluster.id,
                    store_count: storeCount,
                    total_revenue: totalRevenue,
                    avg_transfer_cost: avgTransferCost,
                    performance_score: performanceScore,
                    efficiency_rating:
                        performanceScore > 500000 ? 'High' :
                        performanceScore > 200000 ? 'Medium' : 'Low'
                };
            });

            const systemEfficiency = performanceMetrics.reduce((sum, p) => sum + p.performance_score, 0) / performanceMetrics.length;

            res.json({
                success: true,
                performance_metrics: performanceMetrics,
                system_efficiency: Math.round(systemEfficiency * 100) / 100
            });
        } catch (error) {
            console.error('Error getting cluster performance:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Optimize cluster boundaries
    async optimizeBoundaries(req, res) {
        try {
            const optimized = await clusterManagerService.optimizeClusterBoundaries();
            res.json({ success: true, clusters: optimized });
        } catch (error) {
            console.error('Error optimizing boundaries:', error);
            res.status(500).json({ success: false, error: 'Optimization failed' });
        }
    }

    // Evaluate transfer between stores across clusters
    async evaluateTransfer(req, res) {
        try {
            const { sourceStoreId, targetStoreId, productSku } = req.body;
            const sourceStore = await this.getStoreById(sourceStoreId);
            const targetStore = await this.getStoreById(targetStoreId);

            if (!sourceStore || !targetStore) {
                return res.status(404).json({ success: false, error: 'Store not found' });
            }

            const result = await clusterManagerService.evaluateCrossClusterTransfer(sourceStore, targetStore, productSku);
            res.json({ success: true, evaluation: result });
        } catch (error) {
            console.error('Error evaluating transfer:', error);
            res.status(500).json({ success: false, error: 'Failed to evaluate transfer' });
        }
    }

    // Utility function to fetch store details
    async getStoreById(storeId) {
        const result = await pool.query('SELECT * FROM stores WHERE store_id = $1', [storeId]);
        return result.rows[0];
    }
}

module.exports = new ClusterManagerController();
