const queueProcessor = require('../services/multiQueueProcessor');
const consensusEngine = require('../services/regionalConsensusEngineInstance'); // C4
const { mockAllocationRequests } = require('../mock/multiQueueMockData');

// ✅ In-memory queues
const queues = {
    emergency: [],
    high_priority_queue: [],
    standard: []
};

// ✅ Classify request into the correct queue
function classifyQueue(request) {
    if (request.urgency === 'emergency') return 'emergency';
    if (request.is_private_label && request.behavioral_intelligence) return 'high_priority_queue';
    return 'standard';
}

// 🔄 Add request to in-memory queue
exports.addRequestToQueue = async (req, res) => {
    try {
        const request = req.body;

        if (!consensusEngine.regionalClusters || consensusEngine.regionalClusters.size === 0) {
            return res.status(400).json({
                success: false,
                error: 'Consensus engine not initialized. Run /api/consensus/run first.'
            });
        }

        const queueType = classifyQueue(request);
        queues[queueType].push(request);

        res.json({
            success: true,
            queueType,
            queueStatus: getQueueStatus()
        });
    } catch (error) {
        console.error('Error adding to queue:', error);
        res.status(500).json({ error: error.message });
    }
};

// 🔄 Process all queues
exports.processQueues = async (req, res) => {
    try {
        const results = await queueProcessor.processAllQueues(queues);

        // ✅ Clear queues after processing
        queues.emergency = [];
        queues.high_priority_queue = [];
        queues.standard = [];

        res.json({
            success: true,
            results,
            queueStatus: getQueueStatus()
        });
    } catch (error) {
        console.error('Error processing queues:', error);
        res.status(500).json({ error: error.message });
    }
};

// 📦 Load mock data
exports.loadMockData = (req, res) => {
    mockAllocationRequests.forEach(request => {
        const queueType = classifyQueue(request);
        queues[queueType].push(request);
    });

    res.json({
        success: true,
        message: 'Mock data loaded',
        queueStatus: getQueueStatus()
    });
};

// 🚀 Run mock demo (load + process)
exports.runDemo = async (req, res) => {
    try {
        mockAllocationRequests.forEach(request => {
            const queueType = classifyQueue(request);
            queues[queueType].push(request);
        });

        const results = await queueProcessor.processAllQueues(queues);

        queues.emergency = [];
        queues.high_priority_queue = [];
        queues.standard = [];

        res.json({
            success: true,
            results,
            queueStatus: getQueueStatus()
        });
    } catch (error) {
        console.error('Error running demo:', error);
        res.status(500).json({ error: error.message });
    }
};

// 📊 Return current queue status
exports.getQueueStatus = (req, res) => {
    res.json(getQueueStatus());
};

// Internal helper
function getQueueStatus() {
    return {
        emergency: queues.emergency.length,
        high_priority_queue: queues.high_priority_queue.length,
        standard: queues.standard.length
    };
}
