// /controllers/queueController.js

const queueProcessor = require('../services/multiQueueProcessor');
const { mockAllocationRequests } = require('../mock/multiQueueMockData');

exports.addRequestToQueue = async (req, res) => {  // Must be async
    try {
        const request = req.body;

        const queueType = await queueProcessor.addToQueue(request);  // Must await async call

        res.json({ success: true, queueType, queueStatus: queueProcessor.getQueueStatus() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.processQueues = async (req, res) => {
    try {
        const results = await queueProcessor.processAllQueues();
        res.json({ success: true, results, queueStatus: queueProcessor.getQueueStatus() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getQueueStatus = (req, res) => {
    res.json(queueProcessor.getQueueStatus());
};

exports.loadMockData = (req, res) => {
    mockAllocationRequests.forEach(request => {
        queueProcessor.addToQueue(request);
    });
    res.json({ success: true, message: 'Mock data loaded', queueStatus: queueProcessor.getQueueStatus() });
};

exports.runDemo = async (req, res) => {
    mockAllocationRequests.forEach(request => {
        queueProcessor.addToQueue(request);
    });
    const results = await queueProcessor.processAllQueues();
    res.json({ success: true, results, queueStatus: queueProcessor.getQueueStatus() });
};
