#!/usr/bin/env node

/**
 * API Test Script for Search Optimizer Backend
 * This script tests various endpoints to see what's available
 */

const API_BASE = 'https://search-optimizer.onrender.com';

const endpoints = [
  '/',
  '/api',
  '/api/health',
  '/health',
  '/products',
  '/api/products',
  '/auth',
  '/api/auth',
  '/cart',
  '/api/cart',
  '/users',
  '/api/users',
  '/test',
  '/ping',
  '/status'
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(` ${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
      } catch (e) {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 100)}...`);
      }
    }
  } catch (error) {
    console.log(` ${endpoint}: ${error.message}`);
  }
}

async function testAllEndpoints() {
  console.log(' Testing Search Optimizer API Endpoints\n');
  console.log(` Base URL: ${API_BASE}\n`);
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n Summary:');
  console.log('- If all endpoints return 404, your backend might not be fully deployed');
  console.log('- If some endpoints work, update the API configuration to match');
  console.log('- Check your backend deployment status on Render.com');
}

testAllEndpoints().catch(console.error); 