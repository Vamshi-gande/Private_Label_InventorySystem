const cron = require('node-cron');
const analyzeManagerActions = require('../services/analyzeManagerActions');

// Runs every 5 minutes to analyze manager actions and extract behavioral signals
cron.schedule('*/5 * * * *', async () => {
    try {
        console.log('Running Manager Action Analysis...');
        await analyzeManagerActions();
        console.log('Manager Action Analysis completed');
    } catch (error) {
        console.error('Manager Action Analysis failed:', error.message);
    }
});
