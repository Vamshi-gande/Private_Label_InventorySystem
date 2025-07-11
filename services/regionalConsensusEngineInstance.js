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
    initializeRegionalConsensus,
    getLiveSignalForStore
};
