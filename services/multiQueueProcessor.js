// /services/multiQueueProcessor.js

const pool = require('../config/db');
const axios = require('axios');
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

    async getProductInfo(sku) {
        try {
            const result = await pool.query('SELECT is_private_label FROM products WHERE sku = $1', [sku]);
            if (result.rows.length > 0) {
                return { is_private_label: result.rows[0].is_private_label };
            }
            return { is_private_label: false };
        } catch (error) {
            console.error('Error fetching product info:', error.message);
            return { is_private_label: false };
        }
    }

    async getProductIdBySKU(sku) {
        try {
            const result = await pool.query('SELECT product_id FROM products WHERE sku = $1', [sku]);
            if (result.rows.length > 0) {
                return result.rows[0].product_id;
            }
            return null;
        } catch (error) {
            console.error('Error fetching product ID:', error.message);
            return null;
        }
    }

    async getBehavioralSignal(storeId, productId) {
        try {
            const response = await axios.get('http://localhost:3000/api/manager-actions/signals');
            const signals = response.data;

            const signal = signals.find(s => s.store_id === storeId && s.product_id === productId);

            return signal || null;
        } catch (error) {
            console.error('Error fetching behavioral signal:', error.message);
            return null;
        }
    }

    async assignToQueue(allocationRequest) {
        const product = await this.getProductInfo(allocationRequest.sku);
        const productId = await this.getProductIdBySKU(allocationRequest.sku);
        const signal = await this.getBehavioralSignal(allocationRequest.store_id, productId);

        if (allocationRequest.urgency === 'critical' || allocationRequest.priority_level === 'emergency') {
            return QUEUE_TYPES.EMERGENCY;
        }

        if (product.is_private_label) {
            allocationRequest.behavioral_intelligence = signal;
            return QUEUE_TYPES.HIGH_PRIORITY;
        }

        return QUEUE_TYPES.STANDARD;
    }

    async addToQueue(allocationRequest) {
        const queueType = await this.assignToQueue(allocationRequest);
        this.queues[queueType].push(allocationRequest);
        return queueType;
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
            const signal = request.behavioral_intelligence;

            if (signal) {
                if (signal.signal === 'market_opportunity_detected' && signal.quantity_increase_pct) {
                    adjustedQuantity += adjustedQuantity * (signal.quantity_increase_pct / 100);
                } else if (signal.signal === 'demand_increase_expected' && signal.days_early) {
                    adjustedQuantity *= 1.1;
                } else if (signal.signal === 'volatility_expected') {
                    adjustedQuantity *= 1.05;
                }
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