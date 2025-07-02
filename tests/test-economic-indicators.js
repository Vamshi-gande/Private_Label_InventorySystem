// test-economic-indicators.js
// Tests the classification engine with enhanced economic indicators

require('dotenv').config();
const { classifyAction } = require('../services/classificationEngine');

// Sample test data
const testActions = [
    {
        // Inflation response (quantity reduction during high inflation)
        store_id: 'ST001',
        manager_id: 'MGR001',
        city: 'Miami',
        product_category: 'snacks',
        scheduled_quantity: 100,
        actual_quantity: 80, // 20% reduction
        quantity_variance: 0.8,
        normal_baseline: {
            typical_quantity: 100
        },
        actual_action: {
            actual_quantity: 80,
            economic_context: "high_inflation"
        }
    },
    {
        // Consumer spending response
        store_id: 'ST002',
        manager_id: 'MGR002',
        city: 'New York',
        product_category: 'beverages',
        scheduled_quantity: 100,
        actual_quantity: 140, // 40% increase
        quantity_variance: 1.4,
        normal_baseline: {
            typical_quantity: 100
        },
        actual_action: {
            actual_quantity: 140,
            economic_context: "increased_consumer_spending"
        }
    },
    {
        // Premium product push - competitive response
        store_id: 'ST003',
        manager_id: 'MGR003',
        city: 'Chicago',
        product_category: 'premium ice cream',
        scheduled_quantity: 50,
        actual_quantity: 80, // 60% increase
        quantity_variance: 1.6,
        comments: 'Competitive response to new premium product launch',
        normal_baseline: {
            typical_quantity: 50
        },
        actual_action: {
            actual_quantity: 80
        }
    },
    {
        // Inventory reduction - emergency response
        store_id: 'ST004',
        manager_id: 'MGR004',
        city: 'Los Angeles',
        product_category: 'snacks',
        scheduled_quantity: 100,
        actual_quantity: 70, // 30% reduction
        quantity_variance: 0.7,
        comments: 'Emergency inventory reduction due to warehouse issue',
        comments: 'Reducing inventory levels'
    }
];

// Mock weather data
const mockWeatherData = {
    city: 'Phoenix',
    forecasts: [{ temperature: 28 }] // Not hot enough to trigger weather classification
};

// Mock news data
const mockNewsData = {
    category: 'general',
    articles: [{ title: 'General economic news' }] // Not product-specific
};

// Mock economic data with multiple indicators
const mockEconomicData = {
    indicator: 'UNRATE',
    value: 3.8,
    indicators: {
        'UNRATE': { value: 3.8, date: '2025-06-30' },
        'CPIAUCSL': { value: 315.2, date: '2025-06-30' }, // High inflation
        'PCE': { value: 18700, date: '2025-06-30' }, // High consumer spending
        'UMCSENT': { value: 88.5, date: '2025-06-30' }, // High consumer sentiment
        'RSAFS': { value: 745.3, date: '2025-06-30' }, // Strong retail sales
        'ISRATIO': { value: 1.45, date: '2025-06-30' } // High inventory ratio
    }
};

// Run tests
function runTests() {
    console.log('Testing Classification with Economic Indicators');
    console.log('-----------------------------------------------');
    
    testActions.forEach((action, index) => {
        console.log(`\nTest ${index + 1}: ${action.product_category} - ${action.comments}`);
        
        // Classify the action
        const result = classifyAction(action, mockWeatherData, mockNewsData, mockEconomicData);
        
        // Print the results
        console.log(`Classification: ${result.action_type}`);
        console.log(`Confidence: ${result.confidence}`);
        console.log(`Rationale: ${result.rationale}`);
        
        // Simple check
        if (result.action_type === 'scheduled_order' && result.confidence === 0.5) {
            console.log('No specialized classification detected');
        } else {
            console.log('Successfully classified');
        }
    });
}

// Run the tests
runTests();
