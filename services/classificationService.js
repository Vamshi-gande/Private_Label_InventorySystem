const pool = require('../config/db');

/**
 * Gets product classification summary for each store.
 * Returns a map: { [store_id]: { privateLabelCount, avgPriority } }
 */
async function getProductClassificationStatsByStore() {
    const query = `
        SELECT 
            si.store_id,
            COUNT(p.product_id) FILTER (WHERE p.is_private_label) AS private_label_count,
            AVG(p.calculated_priority) FILTER (WHERE p.is_private_label) AS avg_priority
        FROM store_inventory si
        JOIN products p ON si.product_id = p.product_id
        GROUP BY si.store_id
    `;

    const result = await pool.query(query);

    const stats = {};
    for (const row of result.rows) {
        stats[row.store_id] = {
            privateLabelCount: parseInt(row.private_label_count) || 0,
            avgPriority: parseFloat(row.avg_priority) || 0
        };
    }

    return stats;
}

module.exports = {
    getProductClassificationStatsByStore
};
