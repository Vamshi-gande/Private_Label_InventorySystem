const pool = require('../config/db');
const { getOptimalRouteBetweenStores } = require('./clusterWarehouseBridge');
const warehouseTransferService = require('./warehouseTransferService');
const { getProductClassificationStatsByStore } = require('./classificationService'); // ✅ Fix: Import

class ClusterManagerService {
    constructor() {
        this.clusters = [];
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async createGeographicClusters(targetClusters = 4) {
        const client = await pool.connect();
        try {
            const storeResult = await client.query(`
                SELECT store_id, store_name, latitude, longitude, warehouse_id, annual_revenue
                FROM stores
                WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            `);

            const warehouseResult = await client.query(`
                SELECT warehouse_id, warehouse_name, latitude, longitude, region
                FROM warehouses
                WHERE latitude IS NOT NULL AND longitude IS NOT NULL
                ORDER BY warehouse_id
                LIMIT $1
            `, [targetClusters]);

            const stores = storeResult.rows;
            const warehouses = warehouseResult.rows;

            if (stores.length === 0 || warehouses.length === 0) {
                throw new Error('Insufficient data: stores or warehouses missing');
            }

            // ✅ Fix: Fetch classification stats
            const classificationStats = await getProductClassificationStatsByStore(stores.map(s => s.store_id));

            this.clusters = warehouses.map(warehouse => ({
                id: `CLUSTER_${warehouse.region.toUpperCase()}`,
                name: `${warehouse.region.charAt(0).toUpperCase() + warehouse.region.slice(1)} Cluster`,
                centroid: { lat: warehouse.latitude, lng: warehouse.longitude },
                warehouse_id: warehouse.warehouse_id,
                stores: [],
                total_revenue: 0,
                avg_transfer_cost: 0,
                performance_score: 0
            }));

            stores.forEach(store => {
                const classification = classificationStats[store.store_id] || {
                    privateLabelCount: 0,
                    avgPriority: 0 
                };

                let minDistance = Infinity;
                let assignedCluster = null;

                this.clusters.forEach(cluster => {
                    const distance = this.calculateDistance(
                        store.latitude, store.longitude,
                        cluster.centroid.lat, cluster.centroid.lng
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        assignedCluster = cluster;
                    }
                });

                if (assignedCluster) {
                    const enrichedStore = {
                        ...store,
                        distance_to_centroid: minDistance,
                        privateLabelCount: classification.privateLabelCount,
                        avgPriorityScore: classification.avgPriority
                    };
                    assignedCluster.stores.push(enrichedStore);
                    assignedCluster.total_revenue += store.annual_revenue;
                }
            });

            await this.generateClusterPerformance();
            return this.clusters;

        } finally {
            client.release();
        }
    }

    async generateClusterPerformance() {
        for (const cluster of this.clusters) {
            const storeCount = cluster.stores.length;
            cluster.avg_transfer_cost = storeCount > 0
                ? cluster.stores.reduce((sum, s) => sum + (s.distance_to_centroid * 0.5), 0) / storeCount
                : 0;

            await this.enrichClusterWithPrivateLabelStats(cluster);

            const warehouseStatus = await warehouseTransferService.getWarehouseStatus(cluster.warehouse_id);
            const utilizationPercent = warehouseStatus?.utilization_percentage || 50;
            const capacityScore = 1 - (utilizationPercent / 100);

            cluster.performance_score = (
                (cluster.total_revenue / (cluster.avg_transfer_cost + 1)) *
                (1 + (cluster.privateLabelRatio || 0) * 0.25) *
                (1 + capacityScore)
            );
        }
    }

    async enrichClusterWithPrivateLabelStats(cluster) {
        const storeIds = cluster.stores.map(s => s.store_id);
        if (storeIds.length === 0) {
            cluster.privateLabelRatio = 0;
            cluster.averagePrivateLabelPriority = 0;
            return;
        }

        const result = await pool.query(`
            SELECT 
                is_private_label,
                COUNT(*) AS product_count,
                AVG(calculated_priority) AS avg_priority
            FROM products
            WHERE participate_in_allocation = true
            GROUP BY is_private_label
        `);

        let privateLabelCount = 0, thirdPartyCount = 0, privatePriority = 0;

        result.rows.forEach(row => {
            if (row.is_private_label) {
                privateLabelCount = parseInt(row.product_count);
                privatePriority = parseFloat(row.avg_priority || 0);
            } else {
                thirdPartyCount = parseInt(row.product_count);
            }
        });

        const total = privateLabelCount + thirdPartyCount;
        cluster.privateLabelRatio = total > 0 ? privateLabelCount / total : 0;
        cluster.averagePrivateLabelPriority = privatePriority;
    }

    async evaluateCrossClusterTransfer(sourceStore, targetStore, productSku) {
        const route = await getOptimalRouteBetweenStores(sourceStore.id, targetStore.id, 20, 'standard');
        if (!route) {
            return { feasible: false, reason: 'No valid warehouse route found' };
        }

        const productInfo = await pool.query(`
            SELECT is_private_label, calculated_priority 
            FROM products WHERE sku = $1
        `, [productSku]);

        const product = productInfo.rows[0] || {};
        const privateLabelMultiplier = product.is_private_label ? 1.3 : 1.0;
        const priorityScore = parseFloat(product.calculated_priority || 1.0);

        const transferCost = route.estimated_cost;
        const transferTime = Math.ceil(route.total_distance / 50);
        const isFeasible = transferCost < 100 && transferTime < 8;

        return {
            feasible: isFeasible,
            transfer_cost: transferCost,
            transfer_time: transferTime,
            distance: route.total_distance,
            source_store: sourceStore.store_id,
            target_store: targetStore.store_id,
            efficiency_score: isFeasible ? (priorityScore * 1000) / transferCost : 0
        };
    }

    async optimizeClusterBoundaries() {
        console.log('Optimizing cluster boundaries using route cost...');

        for (const cluster of this.clusters) {
            const underperformingStores = cluster.stores.filter(store =>
                store.distance_to_centroid > 50 && store.annual_revenue < 10000000
            );

            for (const store of underperformingStores) {
                let bestCluster = null;
                let bestScore = 0;

                for (const otherCluster of this.clusters) {
                    if (otherCluster.id === cluster.id) continue;

                    const route = await warehouseTransferService.getRouteCost(store.store_id, otherCluster.warehouse_id);
                    const transferCost = route?.base_cost || (
                        this.calculateDistance(store.latitude, store.longitude, otherCluster.centroid.lat, otherCluster.centroid.lng) * 0.5
                    );

                    const efficiency = store.annual_revenue / (transferCost + 1);
                    if (efficiency > bestScore) {
                        bestScore = efficiency;
                        bestCluster = otherCluster;
                    }
                }

                if (bestCluster) {
                    console.log(`Suggest moving ${store.name} to ${bestCluster.name}`);
                }
            }
        }

        return this.clusters;
    }

    getClusters() {
        return this.clusters;
    }

    getClusterById(clusterId) {
        return this.clusters.find(c => c.id === clusterId);
    }
}

module.exports = new ClusterManagerService();
