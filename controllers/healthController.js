const pool = require('../config/db');

exports.healthCheck = async (req, res) => {
    const healthData = {
        success: true,
        status: 'Service is up',
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        databaseConnection: 'Unknown'
    };

    try {
        // Test database connection with a timeout
        const dbTest = await Promise.race([
            pool.query('SELECT 1+1 AS result'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
        ]);

        if (dbTest.rows.length > 0 && dbTest.rows[0].result === 2) {
            healthData.databaseConnection = 'OK';
        } else {
            healthData.databaseConnection = 'Failed';
        }
    } catch (error) {
        console.warn('Database health check failed:', error.message);
        healthData.databaseConnection = 'Failed';
        healthData.databaseError = error.message;
        // Don't fail the health check if only database is down
    }

    // Always return 200 OK for basic health check
    res.json(healthData);
};
