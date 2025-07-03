// /mock/multiQueueMockData.js

const mockProducts = [
    { sku: 'PL-PASTA-001', name: 'Private Label Pasta', is_private_label: true },
    { sku: 'TP-PASTA-001', name: 'Third Party Pasta', is_private_label: false }
];

const mockBehavioralSignals = {
    ST001: { signal: 'demand_spike_expected', demand_multiplier: 1.4 },
    ST002: { signal: 'supply_disruption_expected', demand_multiplier: 1.6 }
};

const mockAllocationRequests = [
    { request_id: 'REQ001', store_id: 'ST001', sku: 'PL-PASTA-001', quantity_needed: 100, urgency: 'normal', priority_level: 'high' },
    { request_id: 'REQ002', store_id: 'ST002', sku: 'TP-PASTA-001', quantity_needed: 150, urgency: 'normal', priority_level: 'standard' },
    { request_id: 'REQ003', store_id: 'ST003', sku: 'PL-PASTA-001', quantity_needed: 50, urgency: 'critical', priority_level: 'emergency' }
];

module.exports = { mockProducts, mockBehavioralSignals, mockAllocationRequests };
