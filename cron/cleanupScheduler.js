const cron = require('node-cron');
const axios = require('axios');

// Determine API base URL – default to local server port 5000 if not provided
const PORT = process.env.SERVER_PORT || 5000;
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;

// Run every minute
cron.schedule('* * * * *', async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/reservations/cleanup`);
        console.log('Cleanup success:', response.data.message);
    } catch (error) {
        console.error('Cleanup failed:', error.message);
    }
});
