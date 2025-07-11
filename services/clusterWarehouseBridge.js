// services/clusterWarehouseBridge.js

const warehouseTransferService = require('./warehouseTransferService');

async function getOptimalRouteBetweenStores(fromStoreId, toStoreId, quantity, priority = 'standard') {
    try {
        const client = await require('../config/db').connect();
        const route = await warehouseTransferService.findOptimalWarehouseRoute(fromStoreId, toStoreId, quantity, priority, client);
        client.release();
        return route;
    } catch (err) {
        console.error('Failed to get optimal warehouse route:', err.message);
        return null;
    }
}

async function getWarehouseStatuses() {
    try {
        return await warehouseTransferService.getAllWarehouseStatuses();
    } catch (err) {
        console.error('Failed to get warehouse statuses:', err.message);
        return [];
    }
}

module.exports = {
    getOptimalRouteBetweenStores,
    getWarehouseStatuses
};
