// File: tests/test-component8.js

const axios = require('axios');
const baseURL = 'http://localhost:3008';

async function runTests() {
  try {
    console.log('\n✅ STEP 1: Initialize Clusters');
    const initRes = await axios.post(`${baseURL}/clusters/initialize`, { targetClusters: 4 });
    console.log('Clusters initialized:', initRes.data.message);

    console.log('\n✅ STEP 2: Fetch All Clusters');
    const getRes = await axios.get(`${baseURL}/clusters`);
    console.log('Total clusters:', getRes.data.total_clusters);

    console.log('\n✅ STEP 3: Check Cluster Performance');
    const perfRes = await axios.get(`${baseURL}/clusters/performance`);
    console.log('System efficiency:', perfRes.data.system_efficiency);

    console.log('\n✅ STEP 4: Optimize Cluster Boundaries');
    const optRes = await axios.post(`${baseURL}/optimize`);
    console.log('Optimization complete. Cluster count:', optRes.data.length);

    console.log('\n✅ STEP 5: Evaluate Cross-Cluster Transfer');
    const evalRes = await axios.post(`${baseURL}/evaluate-transfer`, {
      sourceStore: { store_id: 'ST001', latitude: 40.7831, longitude: -73.9712 },
      targetStore: { store_id: 'ST004', latitude: 41.8781, longitude: -87.6298 },
      productSku: 'PL-PASTA-001'
    });
    console.log('Transfer evaluation:', evalRes.data);

    console.log('\n✅ STEP 6: Private Label Diagnostics');
    const diagRes = await axios.get(`${baseURL}/clusters/private-label`);
    console.log('Private label insights:', diagRes.data.diagnostics);

    console.log('\n🎉 All tests completed successfully.');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

runTests();
