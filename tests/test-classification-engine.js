// test-classification-engine.js
// Tests the classification engine directly without relying on Jest

require('dotenv').config();
const { classifyAction } = require('../services/classificationEngine');

// Sample test data
const testActions = [
    {
        // Early order with timing variance
        store_id: 'ST001',
        manager_id: 'MGR001',
        city: 'Miami',
        product_category: 'ice_cream',
        scheduled_order_date: '2025-07-15',
        actual_order_date: '2025-06-25',
        scheduled_quantity: 100,
        actual_quantity: 120,
        normal_baseline: {
            typical_order_date: '2025-07-15',
            typical_quantity: 100
        },
        actual_action: {
            actual_order_date: '2025-06-25',
            actual_quantity: 120
        }
    },
    {
        // Bulk order with quantity variance
        store_id: 'ST002',
        manager_id: 'MGR002',
        city: 'New York',
        product_category: 'beverages',
        scheduled_quantity: 100,
        actual_quantity: 200,
        normal_baseline: {
            typical_quantity: 100
        },
        actual_action: {
            actual_quantity: 200
        }
    },
    {
        // Emergency order with explicit comment
        store_id: 'ST003',
        manager_id: 'MGR003',
        city: 'Chicago',
        product_category: 'snacks',
        scheduled_quantity: 100,
        actual_quantity: 120,
        comments: 'Emergency order due to unexpected demand',
        normal_baseline: {
            typical_quantity: 100
        },
        actual_action: {
            actual_quantity: 120
        }
    },
    {
        // Weather-sensitive product with hot weather
        store_id: 'ST004',
        manager_id: 'MGR004',
        city: 'Phoenix',
        product_category: 'ice cream',
        scheduled_quantity: 100,
        actual_quantity: 130,
        normal_baseline: {
            typical_quantity: 100
        },
        actual_action: {
            actual_quantity: 130
        }
    }
];

// Mock data for testing
const mockWeatherData = {
    city: 'Phoenix',
    forecasts: [
        {
            temperature: 35, // Hot weather
            weather: 'Clear',
            description: 'clear sky'
        }
    ]
};

const mockNewsData = {
    category: 'ice_cream',
    articles: [
        {
            title: 'Ice cream shortage expected due to summer heatwave',
            description: 'Retailers preparing for increased ice cream demand'
        }
    ]
};

const mockEconomicData = {
    indicator: 'UNRATE',
    value: 3.6
};

// Run tests
function runTests() {
    console.log('Testing Classification Engine');
    console.log('-------------------------------');
    
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
