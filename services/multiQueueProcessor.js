// /services/multiQueueProcessor.js

const { mockProducts, mockBehavioralSignals } = require('../mock/multiQueueMockData');
const inventoryLogger = require('./inventoryLogger');

const QUEUE_TYPES = {
    HIGH_PRIORITY: 'high_priority_queue',
    STANDARD: 'standard_queue',
    EMERGENCY: 'emergency_queue'
};

class MultiQueueProcessor {
    constructor() {
        this.queues = {
            [QUEUE_TYPES.HIGH_PRIORITY]: [],
            [QUEUE_TYPES.STANDARD]: [],
            [QUEUE_TYPES.EMERGENCY]: []
        };
    }

    assignToQueue(allocationRequest) {
        const product = this.getProductInfo(allocationRequest.sku);
        const signal = this.getBehavioralSignal(allocationRequest.store_id);

        if (allocationRequest.urgency === 'critical' || allocationRequest.priority_level === 'emergency') {
            return QUEUE_TYPES.EMERGENCY;
        }

        if (product.is_private_label) {
            allocationRequest.behavioral_intelligence = signal;
            return QUEUE_TYPES.HIGH_PRIORITY;
        }

        return QUEUE_TYPES.STANDARD;
    }

    addToQueue(allocationRequest) {
        const queueType = this.assignToQueue(allocationRequest);
        this.queues[queueType].push(allocationRequest);
        return queueType;
    }

    getProductInfo(sku) {
        return mockProducts.find(p => p.sku === sku) || { is_private_label: false };
    }

    getBehavioralSignal(storeId) {
        return mockBehavioralSignals[storeId] || null;
    }

    getQueueStatus() {
        return {
            high_priority_queue: this.queues[QUEUE_TYPES.HIGH_PRIORITY].length,
            standard_queue: this.queues[QUEUE_TYPES.STANDARD].length,
            emergency_queue: this.queues[QUEUE_TYPES.EMERGENCY].length
        };
    }

    async processAllQueues() {
        const emergencyResults = await this.processEmergencyQueue();
        const highPriorityResults = await this.processHighPriorityQueue();
        const standardResults = await this.processStandardQueue();

        return {
            emergencyResults,
            highPriorityResults,
            standardResults,
            timestamp: new Date().toISOString()
        };
    }

    async processEmergencyQueue() {
        const processedItems = this.queues[QUEUE_TYPES.EMERGENCY].splice(0).map(request => ({
            ...request,
            final_quantity: Math.ceil(request.quantity_needed * 1.2),
            processed_in: 'EMERGENCY'
        }));

        for (const item of processedItems) {
            await inventoryLogger.logTransaction(item);
        }

        return processedItems;
    }

    async processHighPriorityQueue() {
        const processedItems = this.queues[QUEUE_TYPES.HIGH_PRIORITY].splice(0).map(request => {
            let adjustedQuantity = request.quantity_needed;
            if (request.behavioral_intelligence && request.behavioral_intelligence.demand_multiplier) {
                adjustedQuantity *= request.behavioral_intelligence.demand_multiplier;
            }
            return {
                ...request,
                final_quantity: Math.ceil(adjustedQuantity * 1.5),
                processed_in: 'HIGH_PRIORITY'
            };
        });

        for (const item of processedItems) {
            await inventoryLogger.logTransaction(item);
        }

        return processedItems;
    }

    async processStandardQueue() {
        const processedItems = this.queues[QUEUE_TYPES.STANDARD].splice(0).map(request => ({
            ...request,
            final_quantity: request.quantity_needed,
            processed_in: 'STANDARD'
        }));

        for (const item of processedItems) {
            await inventoryLogger.logTransaction(item);
        }

        return processedItems;
    }
}

module.exports = new MultiQueueProcessor();
