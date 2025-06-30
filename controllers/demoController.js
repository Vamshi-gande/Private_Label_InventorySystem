const pool = require('../config/db');

exports.concurrentReservations = async (req, res) => {
    try {
        const { productId, warehouseId, quantity, numberOfStores } = req.body;

        const stores = [1, 2, 3, 4]; // Example store IDs for simulation
        const promises = [];

        // Simulate multiple concurrent reservation requests
        for (let i = 0; i < Math.min(numberOfStores || 3, stores.length); i++) {
            const promise = pool.query(
                'SELECT * FROM atomic_reserve_inventory($1, $2, $3, $4, $5)',
                [productId, warehouseId, stores[i], quantity, `DEMO_SIMULATION_${Date.now()}`]
            );
            promises.push(promise);
        }

        // Execute all promises simultaneously
        const results = await Promise.all(promises);

        const responses = results.map((result, index) => ({
            storeId: stores[index],
            success: result.rows[0].success,
            message: result.rows[0].message,
            reservationId: result.rows[0].reservation_id
        }));

        const successCount = responses.filter(r => r.success).length;

        res.json({
            success: true,
            message: 'Concurrent reservation simulation completed.',
            results: responses,
            summary: {
                totalAttempts: responses.length,
                successfulReservations: successCount,
                failedAttempts: responses.length - successCount,
                atomicOperationWorking: successCount <= 1 // Only one should succeed if stock is limited
            }
        });

    } catch (error) {
        console.error('Error in concurrent reservation simulation:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
