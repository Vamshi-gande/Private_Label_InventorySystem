const cron = require('node-cron');
const axios = require('axios');

// Run every minute
cron.schedule('* * * * *', async () => {
    try {
        const response = await axios.post('http://localhost:3000/api/reservations/cleanup');
        console.log('Cleanup success:', response.data.message);
    } catch (error) {
        console.error('Cleanup failed:', error.message);
    }
});
