// /services/regionalConsensusEngineInstance.js

const RegionalConsensusEngine = require('./regionalConsensusEngine');
const engine = new RegionalConsensusEngine(0.4);

// Wrapper to match integration test expectation
async function initializeRegionalConsensus(stores, managerActions) {
    await engine.initializeRegionalClusters(stores, managerActions);
    return engine.validateBehavioralSignals(managerActions);
}

function getLiveSignalForStore(storeId, productId) {
    return engine.getLiveSignalForStore(storeId, productId);
}

module.exports = {
    // Engine instances
    initializeRegionalClusters: engine.initializeRegionalClusters.bind(engine),
    validateBehavioralSignals: engine.validateBehavioralSignals.bind(engine),
    getLiveSignalForStore: engine.getLiveSignalForStore.bind(engine),
    

    initializeRegionalConsensus,
    
    get consensusThreshold() { return engine.consensusThreshold; },
    set consensusThreshold(value) { engine.consensusThreshold = value; },
    

    get _latestExtractedSignals() { return engine._latestExtractedSignals; },
    set _latestExtractedSignals(value) { engine._latestExtractedSignals = value; }
};
