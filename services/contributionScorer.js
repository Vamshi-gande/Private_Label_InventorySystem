const pool = require('../config/db');

class ContributionScorer {
    async calculateContributionScore(storeId, sku, requestingStoreId) {
        try {
            // Get store data
            const storeQuery = 'SELECT * FROM stores WHERE store_id = $1';
            
            // Get store inventory data (not warehouse)
            const storeInventoryQuery = `
                SELECT si.*, p.is_private_label 
                FROM store_inventory si
                JOIN products p ON si.product_id = p.product_id
                WHERE si.store_id = $1 AND si.sku = $2
            `;
            
            // Get recent manager actions for behavioral analysis
            const behavioralQuery = 'SELECT * FROM manager_actions WHERE store_id = $1 ORDER BY action_timestamp DESC LIMIT 1';
            
            const [storeData, storeInventoryData, behavioralData] = await Promise.all([
                pool.query(storeQuery, [storeId]),
                pool.query(storeInventoryQuery, [storeId, sku]),
                pool.query(behavioralQuery, [storeId])
            ]);

            if (!storeData.rows[0] || !storeInventoryData.rows[0]) return 0;

            const store = storeData.rows[0];
            const storeInventory = storeInventoryData.rows[0];
            const behavioral = behavioralData.rows[0];

            // Base calculation: Available inventory at store level
            const availableStock = storeInventory.current_stock - storeInventory.safety_stock - (storeInventory.reserved_quantity || 0);
            if (availableStock <= 0) return 0;

            // Calculate factors
            const demandStability = await this.calculateDemandStability(storeInventory, behavioral);
            const transferEfficiency = storeInventory.last_transfer_success_rate || 0.9;
            const regionalPriority = await this.calculateRegionalPriority(storeId, requestingStoreId);
            const privateLabelMultiplier = storeInventory.is_private_label ? 1.5 : 1.0;

            // Calculate final score
            const contributionScore = (
                availableStock * 
                demandStability * 
                transferEfficiency * 
                regionalPriority * 
                privateLabelMultiplier
            );

            return Math.round(contributionScore * 100) / 100;
        } catch (error) {
            console.error('Error calculating contribution score:', error);
            throw error;
        }
    }

    async calculateDemandStability(storeInventory, behavioralSignal) {
        try {
            let stability = 0.75; // Default stability
            
            // Calculate stability based on sales velocity
            if (storeInventory.average_daily_sales > 0) {
                const daysOfStock = storeInventory.current_stock / storeInventory.average_daily_sales;
                
                // More days of stock = more stable = can contribute more
                if (daysOfStock > 14) stability = 0.9;
                else if (daysOfStock > 7) stability = 0.8;
                else if (daysOfStock > 3) stability = 0.6;
                else stability = 0.3;
            }
            
            // Adjust based on manager behavioral intelligence
            if (behavioralSignal) {
                const actionType = behavioralSignal.action_type;
                
                switch (actionType) {
                    case 'emergency_order':
                        stability *= 0.6; // Much less stable
                        break;
                    case 'bulk_order':
                        stability *= 0.7; // Less stable
                        break;
                    case 'early_order':
                        stability *= 0.8; // Slightly less stable
                        break;
                    case 'scheduled_order':
                        stability *= 1.1; // More stable
                        break;
                    default:
                        break;
                }
            }
            
            return Math.min(1.0, Math.max(0.1, stability));
        } catch (error) {
            console.error('Error calculating demand stability:', error);
            return 0.75;
        }
    }

    async calculateRegionalPriority(fromStoreId, toStoreId) {
        try {
            const locationQuery = 'SELECT store_id, latitude, longitude FROM stores WHERE store_id IN ($1, $2)';
            const result = await pool.query(locationQuery, [fromStoreId, toStoreId]);
            
            if (result.rows.length !== 2) return 0.5;
            
            const fromStore = result.rows.find(s => s.store_id == fromStoreId);
            const toStore = result.rows.find(s => s.store_id == toStoreId);
            
            if (!fromStore || !toStore || !fromStore.latitude || !toStore.latitude) return 0.5;
            
            // Haversine formula for distance calculation
            const R = 6371; // Earth's radius in km
            const dLat = (toStore.latitude - fromStore.latitude) * Math.PI / 180;
            const dLon = (toStore.longitude - fromStore.longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                     Math.cos(fromStore.latitude * Math.PI / 180) * Math.cos(toStore.latitude * Math.PI / 180) *
                     Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            // Closer stores get higher priority
            const priority = Math.max(0.1, 1 - (distance / 500));
            return priority;
        } catch (error) {
            console.error('Error calculating regional priority:', error);
            return 0.5;
        }
    }

    async applyDynamicBoundaries(contributionScore, storeId, sku) {
        try {
            const query = `
                SELECT si.current_stock, p.is_private_label 
                FROM store_inventory si
                JOIN products p ON si.product_id = p.product_id
                WHERE si.store_id = $1 AND si.sku = $2
            `;
            const result = await pool.query(query, [storeId, sku]);
            
            if (!result.rows[0]) return contributionScore;
            
            const { current_stock, is_private_label } = result.rows[0];
            
            // Dynamic boundaries based on product type
            const minPercent = is_private_label ? 0.15 : 0.10;
            const maxPercent = is_private_label ? 0.60 : 0.40;
            
            const minContribution = current_stock * minPercent;
            const maxContribution = current_stock * maxPercent;
            
            return Math.min(maxContribution, Math.max(minContribution, contributionScore));
        } catch (error) {
            console.error('Error applying dynamic boundaries:', error);
            return contributionScore;
        }
    }

    async findContributors(requestingStoreId, sku, neededQuantity) {
        try {
            const contributorQuery = `
                SELECT s.store_id, s.store_name, si.current_stock, si.safety_stock, 
                       si.reserved_quantity, p.is_private_label, si.last_transfer_success_rate
                FROM stores s
                JOIN store_inventory si ON s.store_id = si.store_id
                JOIN products p ON si.product_id = p.product_id
                WHERE s.store_id != $1 AND si.sku = $2 
                AND (si.current_stock - si.safety_stock - COALESCE(si.reserved_quantity, 0)) > 0
            `;
            
            const potentialContributors = await pool.query(contributorQuery, [requestingStoreId, sku]);
            const contributors = [];
            
            for (const store of potentialContributors.rows) {
                const score = await this.calculateContributionScore(store.store_id, sku, requestingStoreId);
                
                if (score > 0) {
                    const adjustedScore = await this.applyDynamicBoundaries(score, store.store_id, sku);
                    
                    contributors.push({
                        store_id: store.store_id,
                        store_name: store.store_name,
                        contribution_score: adjustedScore,
                        available_to_contribute: Math.min(adjustedScore, neededQuantity),
                        transfer_efficiency: store.last_transfer_success_rate || 0.9,
                        is_private_label: store.is_private_label,
                        current_stock: store.current_stock,
                        available_stock: store.current_stock - store.safety_stock - (store.reserved_quantity || 0)
                    });
                }
            }
            
            return contributors.sort((a, b) => b.contribution_score - a.contribution_score);
        } catch (error) {
            console.error('Error finding contributors:', error);
            throw error;
        }
    }

    async batchContributionAnalysis(requests) {
        try {
            const results = [];
            
            for (const request of requests) {
                const contributors = await this.findContributors(
                    request.requesting_store_id,
                    request.sku,
                    request.needed_quantity
                );
                
                const totalAvailable = contributors.reduce((sum, c) => sum + c.available_to_contribute, 0);
                
                results.push({
                    request: request,
                    contributors: contributors,
                    fulfillment_possible: totalAvailable >= request.needed_quantity,
                    total_available: totalAvailable,
                    shortfall: Math.max(0, request.needed_quantity - totalAvailable)
                });
            }
            
            return results;
        } catch (error) {
            console.error('Error in batch contribution analysis:', error);
            throw error;
        }
    }

    async recordContribution(fromStoreId, toStoreId, sku, contributionScore, quantityContributed, transferSuccess = true) {
        try {
            const query = `
                INSERT INTO contribution_history 
                (from_store_id, to_store_id, sku, contribution_score, quantity_contributed, transfer_success)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `;
            
            const result = await pool.query(query, [
                fromStoreId, toStoreId, sku, contributionScore, quantityContributed, transferSuccess
            ]);
            
            return result.rows[0].id;
        } catch (error) {
            console.error('Error recording contribution:', error);
            throw error;
        }
    }
}

module.exports = new ContributionScorer();