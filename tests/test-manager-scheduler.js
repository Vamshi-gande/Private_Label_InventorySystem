const analyzeManagerActions = require('../services/analyzeManagerActions');

async function testManagerActionsScheduler() {
    console.log('Testing Manager Actions Scheduler manually...\n');
    
    try {
        const result = await analyzeManagerActions();
        console.log('\nManager Actions Scheduler test completed successfully!');
        if (result) {
            console.log('Analysis summary:', result);
        }
    } catch (error) {
        console.error('Manager Actions Scheduler test failed:', error.message);
    }
}

testManagerActionsScheduler();
