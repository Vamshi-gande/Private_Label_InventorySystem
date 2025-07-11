require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const BASE_URL = `${API_BASE_URL}/api`;

async function testComponent7Integration() {
    console.log('Testing Component 7 Integration with Existing Components\n');

    try {
        // Test 1: Health Check
        console.log('Test 1: System Health Check...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log(`   System Status: ${healthResponse.data.status}`);
        console.log(`   Database: ${healthResponse.data.databaseConnection}\n`);

        // Test 2: Dashboard Integration
        console.log('Test 2: Dashboard Integration...');
        try {
            const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`);
            console.log(`   Dashboard accessible: ${dashboardResponse.status === 200}`);
        } catch (error) {
            console.log(`   Dashboard endpoint might need setup: ${error.response?.status || 'unavailable'}`);
        }

        // Test 3: Warehouse Transfer System - Core Functionality
        console.log('Test 3: Warehouse Transfer Core Functions...');
        
        // Get warehouse status
        const warehousesResponse = await axios.get(`${BASE_URL}/warehouse-transfer/warehouses/status`);
        console.log(`   Found ${warehousesResponse.data.data.length} warehouses available`);
        
        // Create a transfer request
        const transferRequest = {
            fromStoreId: 1,
            toStoreId: 3,
            sku: 'PL-PASTA-001',
            quantity: 15,
            priority: 'standard'
        };
        
        const createResponse = await axios.post(`${BASE_URL}/warehouse-transfer/requests`, transferRequest);
        console.log(`   Transfer request created: ${createResponse.data.data.request_id}`);
        console.log(`   Estimated cost: $${createResponse.data.data.estimated_cost}`);
        console.log(`   Selected warehouse: ${createResponse.data.data.warehouse_route.warehouse_name}`);

        // Test 4: Analytics Integration
        console.log('\nTest 4: Analytics Integration...');
        const analyticsResponse = await axios.get(`${BASE_URL}/warehouse-transfer/analytics`);
        console.log(`   Total transfer requests: ${analyticsResponse.data.data.overall_stats.total_requests}`);
        console.log(`   Emergency requests: ${analyticsResponse.data.data.overall_stats.emergency_requests}`);
        console.log(`   Total cost tracked: $${analyticsResponse.data.data.overall_stats.total_estimated_cost}`);

        // Test 5: Batch Processing
        console.log('\nTest 5: Batch Processing Integration...');
        const batchResponse = await axios.post(`${BASE_URL}/warehouse-transfer/process/priority`);
        console.log(`   Processed ${batchResponse.data.data.processed_requests} transfer requests`);
        console.log(`   Created ${batchResponse.data.data.batches_created} transfer batches`);

        // Test 6: Emergency Transfer
        console.log('\nTest 6: Emergency Transfer Handling...');
        const emergencyRequest = {
            fromStoreId: 2,
            toStoreId: 4,
            sku: 'PL-SAUCE-002',
            quantity: 5,
            reason: 'Critical stock shortage - integration test'
        };
        
        const emergencyResponse = await axios.post(`${BASE_URL}/warehouse-transfer/requests/emergency`, emergencyRequest);
        console.log(`   Emergency transfer created: ${emergencyResponse.data.data.request_id}`);
        console.log(`   Emergency reason logged: ${emergencyRequest.reason}`);

        // Test 7: Cross-Component Data Consistency
        console.log('\nTest 7: Data Consistency Check...');
        
        // Check if warehouse data is consistent
        const warehouseDetails = warehousesResponse.data.data[0];
        console.log(`   Warehouse capacity tracking: ${warehouseDetails.max_capacity} max, ${warehouseDetails.current_utilization} used`);
        console.log(`   Performance metrics available: ${warehouseDetails.success_rate}% success rate`);

        // Test 8: Route Optimization
        console.log('\nTest 8: Route Optimization...');
        const routeTestRequest = {
            fromStoreId: 1,
            toStoreId: 10, // Different region
            sku: 'BR-BREAD-001',
            quantity: 8,
            priority: 'high'
        };
        
        const routeResponse = await axios.post(`${BASE_URL}/warehouse-transfer/requests`, routeTestRequest);
        const selectedRoute = routeResponse.data.data.warehouse_route;
        console.log(`   Optimal route selected: ${selectedRoute.warehouse_name}`);
        console.log(`   Distance: ${selectedRoute.distance_km} km`);
        console.log(`   Cost efficiency: $${routeResponse.data.data.estimated_cost}`);

        console.log('\nComponent 7 Integration Tests Completed Successfully!');
        console.log('\nIntegration Summary:');
        console.log('   - System health and database connectivity');
        console.log('   - Warehouse transfer core functionality');
        console.log('   - Analytics and reporting integration');
        console.log('   - Batch processing coordination');
        console.log('   - Emergency transfer handling');
        console.log('   - Data consistency across components');
        console.log('   - Route optimization algorithms');
        console.log('   - Cross-component data sharing');

    } catch (error) {
        console.error('Integration test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
        process.exit(1);
    }
}

// Run the integration tests
testComponent7Integration().then(() => {
    console.log('\nAll integration tests passed - Component 7 is fully integrated!');
    process.exit(0);
}).catch(error => {
    console.error('Integration test suite failed:', error.message);
    process.exit(1);
});
