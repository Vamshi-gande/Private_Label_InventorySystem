const pool = require('../config/db');

exports.healthCheck = async (req, res) => {
    try {
        // Simple database connection test
        const dbTest = await pool.query('SELECT 1+1 AS result');

        if (dbTest.rows.length > 0 && dbTest.rows[0].result === 2) {
            res.json({
                success: true,
                status: 'Service is up',
                timestamp: new Date(),
                databaseConnection: 'OK'
            });
        } else {
            res.status(500).json({
                success: false,
                status: 'Database connection failed'
            });
        }
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            status: 'Internal server error',
            details: error.message
        });
    }
};
