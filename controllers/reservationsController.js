const pool = require('../config/db');

exports.createReservation = async (req, res) => {
    const client = await pool.connect();
    try {
        const { productId, warehouseId, requestingStoreId, quantity } = req.body;

        if (!productId || !warehouseId || !requestingStoreId || !quantity) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        await client.query('BEGIN');  // Start transaction

        // Step 1: Lock inventory row
        const lockQuery = `
            SELECT * FROM inventory
            WHERE product_id = $1 AND warehouse_id = $2
            FOR UPDATE
        `;
        const inventoryResult = await client.query(lockQuery, [productId, warehouseId]);

        if (inventoryResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Inventory not found.' });
        }

        const inventory = inventoryResult.rows[0];

        // Step 2: Check stock
        if (inventory.available_quantity < quantity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient inventory.' });
        }

        // Step 3: Reserve inventory
        const updateQuery = `
            UPDATE inventory
            SET available_quantity = available_quantity - $1,
                reserved_quantity = reserved_quantity + $1
            WHERE inventory_id = $2
        `;
        await client.query(updateQuery, [quantity, inventory.inventory_id]);

        // Step 4: Create reservation
        const insertReservationQuery = `
            INSERT INTO inventory_reservations (inventory_id, product_id, requesting_store_id, reserved_quantity)
            VALUES ($1, $2, $3, $4)
            RETURNING reservation_id
        `;
        const reservationResult = await client.query(insertReservationQuery, [
            inventory.inventory_id, productId, requestingStoreId, quantity
        ]);

        // Step 5: Log transaction
        const insertTransactionQuery = `
            INSERT INTO inventory_transactions (inventory_id, product_id, transaction_type, quantity_change)
            VALUES ($1, $2, 'RESERVE', $3)
        `;
        await client.query(insertTransactionQuery, [
            inventory.inventory_id, productId, -quantity
        ]);

        await client.query('COMMIT');

        res.json({
            success: true,
            reservationId: reservationResult.rows[0].reservation_id,
            expiresIn: '5 minutes'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Reservation error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    } finally {
        client.release();
    }
};
exports.getActiveReservations = async (req, res) => {
    try {
        const query = `
            SELECT 
                r.reservation_id,
                r.reserved_quantity,
                r.reservation_timestamp,
                r.expiry_timestamp,
                s.store_name,
                w.warehouse_name,
                p.product_name,
                p.is_private_label,
                EXTRACT(EPOCH FROM (r.expiry_timestamp - CURRENT_TIMESTAMP)) AS seconds_until_expiry
            FROM inventory_reservations r
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN products p ON r.product_id = p.product_id
            JOIN warehouses w ON i.warehouse_id = w.warehouse_id
            JOIN stores s ON r.requesting_store_id = s.store_id
            WHERE r.status = 'ACTIVE'
            ORDER BY r.reservation_timestamp DESC
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            activeReservations: result.rows.length,
            data: result.rows.map(row => ({
                reservationId: row.reservation_id,
                productName: row.product_name,
                warehouseName: row.warehouse_name,
                storeName: row.store_name,
                reservedQuantity: row.reserved_quantity,
                reservationTime: row.reservation_timestamp,
                expiryTime: row.expiry_timestamp,
                secondsUntilExpiry: row.seconds_until_expiry,
                isExpiringSoon: row.seconds_until_expiry < 60,
                isPrivateLabel: row.is_private_label
            }))
        });

    } catch (error) {
        console.error('Error fetching active reservations:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
exports.cleanupExpiredReservations = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Find expired active reservations
        const expiredQuery = `
            SELECT * FROM inventory_reservations
            WHERE status = 'ACTIVE' AND expiry_timestamp <= CURRENT_TIMESTAMP
            FOR UPDATE
        `;
        const expiredResult = await client.query(expiredQuery);

        if (expiredResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.json({ success: true, message: 'No expired reservations found.' });
        }

        let cleanedUpCount = 0;

        // Process each expired reservation
        for (const reservation of expiredResult.rows) {
            // Step 1: Return quantity to available inventory
            const updateInventoryQuery = `
                UPDATE inventory
                SET available_quantity = available_quantity + $1,
                    reserved_quantity = reserved_quantity - $1
                WHERE inventory_id = $2
            `;
            await client.query(updateInventoryQuery, [reservation.reserved_quantity, reservation.inventory_id]);

            // Step 2: Mark reservation as expired
            const updateReservationQuery = `
                UPDATE inventory_reservations
                SET status = 'EXPIRED'
                WHERE reservation_id = $1
            `;
            await client.query(updateReservationQuery, [reservation.reservation_id]);

            // Step 3: Log the transaction
            const insertTransactionQuery = `
                INSERT INTO inventory_transactions (inventory_id, product_id, transaction_type, quantity_change)
                VALUES ($1, $2, 'RELEASE', $3)
            `;
            await client.query(insertTransactionQuery, [
                reservation.inventory_id,
                reservation.product_id,
                reservation.reserved_quantity
            ]);

            cleanedUpCount++;
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Cleaned up ${cleanedUpCount} expired reservations.`,
            cleanedUpCount
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error cleaning up expired reservations:', error);
        res.status(500).json({ error: 'Internal server error.' });
    } finally {
        client.release();
    }
};
