const clusterManagerService = require('../services/clusterManagerService');

async function initializeDefaultClusters() {
    try {
        const existingClusters = await clusterManagerService.getClusters();

        if (existingClusters.length === 0) {
            console.log('No clusters found. Initializing default clusters...');
            const result = await clusterManagerService.createGeographicClusters(4);
            console.log(`Initialized ${result.length} default geographic clusters.`);
        } else {
            console.log(`${existingClusters.length} clusters already exist. Skipping initialization.`);
        }
    } catch (error) {
        console.error('Error during cluster initialization:', error.message);
    }
}

module.exports = initializeDefaultClusters;
