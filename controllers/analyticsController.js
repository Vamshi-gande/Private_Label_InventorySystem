const pool = require('../config/db');

exports.privateLabelComparison = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.is_private_label,
                COUNT(*) AS product_count,
                SUM(i.available_quantity) AS total_available,
                SUM(i.reserved_quantity) AS total_reserved,
                AVG(p.profit_margin_percentage) AS avg_profit_margin,
                SUM(i.available_quantity * p.selling_price) AS total_inventory_value
            FROM products p
            JOIN inventory i ON p.product_id = i.product_id
            GROUP BY p.is_private_label
        `;

        const result = await pool.query(query);

        // Separate data into private label and third-party buckets
        const comparison = {
            private_label: result.rows.find(row => row.is_private_label === true) || {
                product_count: 0,
                total_available: 0,
                total_reserved: 0,
                avg_profit_margin: 0,
                total_inventory_value: 0
            },
            third_party: result.rows.find(row => row.is_private_label === false) || {
                product_count: 0,
                total_available: 0,
                total_reserved: 0,
                avg_profit_margin: 0,
                total_inventory_value: 0
            }
        };

        res.json({
            success: true,
            comparison,
            insights: {
                privateLabelAdvantage: (comparison.private_label.avg_profit_margin || 0) - (comparison.third_party.avg_profit_margin || 0),
                totalInventoryValue: parseFloat(comparison.private_label.total_inventory_value || 0) + parseFloat(comparison.third_party.total_inventory_value || 0)
            }
        });

    } catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
