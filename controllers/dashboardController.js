const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const query = `
            SELECT 
                is_private_label,
                COUNT(*) AS product_count,
                AVG(calculated_priority) AS average_priority
            FROM products
            GROUP BY is_private_label
        `;

        const result = await pool.query(query);

        let privateLabelCount = 0, thirdPartyCount = 0;
        let averagePrivateLabelPriority = 0, averageThirdPartyPriority = 0;
        let totalProducts = 0;

        result.rows.forEach(row => {
            if (row.is_private_label) {
                privateLabelCount = parseInt(row.product_count);
                averagePrivateLabelPriority = parseFloat(row.average_priority).toFixed(2);
            } else {
                thirdPartyCount = parseInt(row.product_count);
                averageThirdPartyPriority = parseFloat(row.average_priority).toFixed(2);
            }
            totalProducts += parseInt(row.product_count);
        });

        res.json({
            success: true,
            stats: {
                totalProducts,
                privateLabelCount,
                thirdPartyCount,
                averagePrivateLabelPriority: parseFloat(averagePrivateLabelPriority),
                averageThirdPartyPriority: parseFloat(averageThirdPartyPriority)
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
