require('dotenv').config();
const consensusEngine = require('../services/regionalConsensusEngineInstance');
const queueProcessor = require('../services/multiQueueProcessor');
const contributionScorer = require('../services/contributionScorer');

const stores = [
  { store_id: 1, location: { lat: 12.9716, lng: 77.5946 } },
  { store_id: 2, location: { lat: 13.0827, lng: 80.2707 } },
  { store_id: 3, location: { lat: 17.3850, lng: 78.4867 } }
];

const managerActions = [
  {
    store_id: 1,
    manager_id: 101,
    product_id: 17,
    action_type: 'scheduled_order',
    timestamp: new Date().toISOString(),
    extracted_intelligence: {
      signal: 'demand_increase_expected',
      confidence: 0.85,
      magnitude: 'high'
    }
  },
  {
    store_id: 2,
    manager_id: 102,
    product_id: 17,
    action_type: 'early_order',
    timestamp: new Date().toISOString(),
    extracted_intelligence: {
      signal: 'market_opportunity_detected',
      confidence: 0.75,
      quantity_increase_pct: 20
    }
  },
  {
    store_id: 3,
    manager_id: 103,
    product_id: 17,
    action_type: 'emergency_order',
    timestamp: new Date().toISOString(),
    extracted_intelligence: {
      signal: 'volatility_expected',
      confidence: 0.9
    }
  }
];

const mockRequests = [
  {
    request_id: 'REQ001',
    store_id: 1,
    sku: 'PL-PASTA-001',
    quantity_needed: 80,
    urgency: 'normal',
    priority_level: 'high'
  },
  {
    request_id: 'REQ002',
    store_id: 2,
    sku: 'PL-PASTA-001',
    quantity_needed: 120,
    urgency: 'critical',
    priority_level: 'emergency'
  },
  {
    request_id: 'REQ003',
    store_id: 3,
    sku: 'PL-PASTA-001',
    quantity_needed: 60,
    urgency: 'normal',
    priority_level: 'standard'
  }
];

async function runIntegrationTest() {
  console.log('\n🔗 Running C4 + C5 + C6 Integration Test...\n');

  try {
    // ✅ C4: Cluster Initialization + Consensus
    await consensusEngine.initializeRegionalClusters(stores, managerActions);
    const report = await consensusEngine.validateBehavioralSignals(managerActions);
    console.log('✅ C4 Consensus Report:', JSON.stringify(report, null, 2));

    // ✅ C5: Queue & Process Requests
    for (const request of mockRequests) {
      await queueProcessor.addToQueue(request);
    }

    const queueStatus = queueProcessor.getQueueStatus();
    console.log('\n📦 Queue Status:', queueStatus);

    const results = await queueProcessor.processAllQueues();
    console.log('\n✅ C5+C6 Processed Results:', JSON.stringify(results, null, 2));

    console.log('\n🎯 Integration Test Passed.');
  } catch (err) {
    console.error('❌ Integration Test Failed:', err.message);
  } finally {
    process.exit(0);
  }
}

runIntegrationTest();
