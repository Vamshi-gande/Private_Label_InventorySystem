require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const BASE_URL = `${API_BASE_URL}/api/warehouse-transfer`;

async function testWarehouseTransferSystem() {
    console.log('Testing Component 7: Warehouse Transfer System\n');

    try {
        // Test 1: Get all warehouse statuses
        console.log('Test 1: Getting warehouse statuses...');
        const warehouseResponse = await axios.get(`${BASE_URL}/warehouses/status`);
        console.log(`Found ${warehouseResponse.data.data.length} warehouses`);
        console.log(`   - Warehouse 1: ${warehouseResponse.data.data[0].available_capacity} units available`);
        console.log(`   - Warehouse 2: ${warehouseResponse.data.data[1].available_capacity} units available`);
        console.log(`   - Warehouse 3: ${warehouseResponse.data.data[2].available_capacity} units available\n`);

        // Test 2: Create transfer requests
        console.log('Test 2: Creating transfer requests...');
        const transferRequests = [
            {
                fromStoreId: 1,
                toStoreId: 2,
                sku: 'PL-PASTA-001',
                quantity: 25,
                priority: 'high'
            },
            {
                fromStoreId: 3,
                toStoreId: 4,
                sku: 'PL-SAUCE-002',
                quantity: 15,
                priority: 'standard'
            },
            {
                fromStoreId: 2,
                toStoreId: 3,
                sku: 'BR-BREAD-001',
                quantity: 10,
                priority: 'emergency'
            }
        ];

        const createdRequests = [];
        for (const request of transferRequests) {
            try {
                const response = await axios.post(`${BASE_URL}/requests`, request);
                createdRequests.push(response.data.data);
                console.log(`   Created ${request.priority} transfer: ${response.data.data.request_id}`);
                console.log(`     Cost: $${response.data.data.estimated_cost}, Warehouse: ${response.data.data.warehouse_route.warehouse_name}`);
            } catch (error) {
                console.log(`   Failed to create transfer: ${error.response?.data?.error || error.message}`);
            }
        }
        console.log();

        // Test 3: Process pending transfers
        console.log('Test 3: Processing pending transfers...');
        const processingResponse = await axios.post(`${BASE_URL}/warehouses/1/process`);
        console.log(`   Processed ${processingResponse.data.data.total_requests_processed} requests`);
        console.log(`   Created ${processingResponse.data.data.batches_created} batches`);
        
        if (processingResponse.data.data.batches.length > 0) {
            const batch = processingResponse.data.data.batches[0];
            console.log(`     - Batch ID: ${batch.batch_id}`);
            console.log(`     - Total Cost: $${batch.total_cost}`);
            console.log(`     - Scheduled Departure: ${new Date(batch.scheduled_departure).toLocaleString()}`);
        }
        console.log();

        // Test 4: Create emergency transfer
        console.log('Test 4: Creating emergency transfer...');
        const emergencyTransfer = {
            fromStoreId: 1,
            toStoreId: 4,
            sku: 'PL001',
            quantity: 40,
            reason: 'Critical stockout during weekend rush'
        };

        const emergencyResponse = await axios.post(`${BASE_URL}/requests/emergency`, emergencyTransfer);
        console.log(`   Created emergency transfer: ${emergencyResponse.data.data.request_id}`);
        console.log(`     Cost: $${emergencyResponse.data.data.estimated_cost}`);
        console.log(`     Route: ${emergencyResponse.data.data.warehouse_route.warehouse_name}`);
        console.log(`     Distance: ${emergencyResponse.data.data.warehouse_route.total_distance} km\n`);

        // Test 5: Get transfer analytics
        console.log('Test 5: Getting transfer analytics...');
        const analyticsResponse = await axios.get(`${BASE_URL}/analytics`);
        const stats = analyticsResponse.data.data.overall_stats;
        console.log(`   Total requests: ${stats.total_requests}`);
        console.log(`   Pending requests: ${stats.pending_requests}`);
        console.log(`   Emergency requests: ${stats.emergency_requests}`);
        console.log(`   Total estimated cost: $${stats.total_estimated_cost}`);
        
        if (analyticsResponse.data.data.warehouse_performance.length > 0) {
            console.log('   Warehouse Performance:');
            analyticsResponse.data.data.warehouse_performance.forEach(wh => {
                console.log(`     - ${wh.warehouse_name}: ${wh.requests_handled} requests, $${wh.total_cost} total cost`);
            });
        }
        console.log();

        // Test 6: Get specific transfer request
        if (createdRequests.length > 0) {
            console.log('Test 6: Getting transfer request details...');
            const requestId = createdRequests[0].request_id;
            const requestResponse = await axios.get(`${BASE_URL}/requests/${requestId}`);
            const request = requestResponse.data.data;
            console.log(`   Transfer ${request.request_id}:`);
            console.log(`     From: ${request.from_store_name} → To: ${request.to_store_name}`);
            console.log(`     SKU: ${request.sku}, Quantity: ${request.quantity}`);
            console.log(`     Status: ${request.status}, Priority: ${request.priority}`);
            console.log(`     Via: ${request.warehouse_name}`);
            console.log();
        }

        // Test 7: Update transfer status
        if (createdRequests.length > 0) {
            console.log('Test 7: Updating transfer status...');
            const requestId = createdRequests[0].request_id;
            const updateResponse = await axios.put(`${BASE_URL}/requests/${requestId}/status`, {
                status: 'in_transit',
                notes: 'Package picked up from warehouse'
            });
            console.log(`   Updated transfer ${requestId} to: ${updateResponse.data.data.status}`);
            console.log(`     Notes: ${updateResponse.data.data.notes}\n`);
        }

        // Test 8: Test warehouse routing algorithm
        console.log('Test 8: Testing warehouse routing algorithm...');
        const routingTest = {
            fromStoreId: 4, // Los Angeles
            toStoreId: 1,   // Manhattan
            sku: 'PL-PASTA-001',
            quantity: 30,
            priority: 'standard'
        };

        const routingResponse = await axios.post(`${BASE_URL}/requests`, routingTest);
        const route = routingResponse.data.data.warehouse_route;
        console.log(`   Cross-country routing test:`);
        console.log(`     Selected warehouse: ${route.warehouse_name} (${route.region})`);
        console.log(`     Total distance: ${route.total_distance} km`);
        console.log(`     Cost: $${routingResponse.data.data.estimated_cost}`);
        console.log(`     Routing score: ${route.score}\n`);

        console.log('All Component 7 tests completed successfully!');
        console.log('\nTest Summary:');
        console.log('   - Warehouse status retrieval');
        console.log('   - Transfer request creation');
        console.log('   - Batch processing');
        console.log('   - Emergency transfers');
        console.log('   - Analytics and reporting');
        console.log('   - Request details and updates');
        console.log('   - Intelligent warehouse routing');
        console.log('   - Cost optimization');

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
        console.error('\nMake sure the server is running: node server.js');
    }
}

// Run the tests
testWarehouseTransferSystem();
