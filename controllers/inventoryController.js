const pool = require('../config/db');

exports.getInventoryStatus = async (req, res) => {
    const { productId } = req.params;

    try {
        const query = `
            SELECT 
                i.inventory_id,
                w.warehouse_name,
                i.available_quantity,
                i.reserved_quantity,
                i.safety_stock_level,
                p.product_name,
                p.is_private_label,
                p.profit_margin_percentage
            FROM inventory i
            JOIN warehouses w ON i.warehouse_id = w.warehouse_id
            JOIN products p ON i.product_id = p.product_id
            WHERE i.product_id = $1
        `;

        const result = await pool.query(query, [productId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Inventory not found for this product.' });
        }

        const totalAvailable = result.rows.reduce((sum, row) => sum + row.available_quantity, 0);
        const totalReserved = result.rows.reduce((sum, row) => sum + row.reserved_quantity, 0);

        res.json({
            success: true,
            product: result.rows[0].product_name,
            isPrivateLabel: result.rows[0].is_private_label,
            profitMargin: result.rows[0].profit_margin_percentage,
            inventoryByWarehouse: result.rows,
            summary: {
                totalAvailable,
                totalReserved
            }
        });

    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
