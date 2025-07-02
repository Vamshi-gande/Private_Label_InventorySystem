const kmeans = require('ml-kmeans');

function clusterStores(stores, managerActions) {
    const storeData = stores.map(store => ({
        ...store,
        demandScore: calculateStoreDemandScore(managerActions, store.store_id)
    }));

    // ✅ Clean and validate data points
    const validStores = storeData.filter(store => {
        return (
            store.location &&
            typeof store.location.lat === 'number' &&
            typeof store.location.lng === 'number' &&
            !isNaN(store.location.lat) &&
            !isNaN(store.location.lng)
        );
    });

    if (validStores.length === 0) {
        throw new Error('No valid store locations available for clustering.');
    }

    const clusterCount = Math.min(5, validStores.length); // Avoid asking for more clusters than data points

    const dataPoints = validStores.map(store => [store.location.lat, store.location.lng]);

    const clusteringResult = kmeans.kmeans(dataPoints, clusterCount);

    const clusters = {};
    clusteringResult.clusters.forEach((clusterIndex, i) => {
        const regionName = `region_${clusterIndex + 1}`;
        if (!clusters[regionName]) clusters[regionName] = [];
        clusters[regionName].push(validStores[i]);
    });

    return clusters;
}

function calculateStoreDemandScore(managerActions, storeId) {
    const recentActions = managerActions.filter(action => action.store_id === storeId);
    return recentActions.reduce((sum, action) => sum + (action.extracted_intelligence?.confidence || 0.5), 0);
}

module.exports = { clusterStores };
