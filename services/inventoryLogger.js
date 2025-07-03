// /services/inventoryLogger.js

const pool = require('../config/db');

class InventoryLogger {
    async logTransaction({ request_id, store_id, sku, quantity_needed, final_quantity, processed_in }) {
        try {
            const query = `
                INSERT INTO inventory_transactions
                    (request_id, store_id, sku, transaction_type, original_quantity, final_quantity, processing_queue, transaction_timestamp)
                VALUES
                    ($1, $2, $3, $4, $5, $6, $7, NOW())
            `;
            const values = [
                request_id,
                store_id,
                sku,
                'ALLOCATE',
                quantity_needed,
                final_quantity,
                processed_in
            ];

            await pool.query(query, values);
            console.log(`Transaction logged for request: ${request_id}`);
        } catch (error) {
            console.error(`Error logging transaction: ${error.message}`);
        }
    }
}

module.exports = new InventoryLogger();
