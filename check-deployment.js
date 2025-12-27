#!/usr/bin/env node

/**
 * Backend Deployment Check Script
 * This script helps diagnose deployment issues with your Search Optimizer backend
 */

const API_BASE = 'https://search-optimizer.onrender.com';

async function checkDeployment() {
  console.log('🔍 Search Optimizer Backend Deployment Check\n');
  console.log(`🌐 Backend URL: ${API_BASE}\n`);

  // Test 1: Basic connectivity
  console.log('1️⃣ Testing basic connectivity...');
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'User-Agent': 'Search-Optimizer-Frontend/1.0',
      },
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    if (response.status === 404) {
      console.log('   ⚠️  Server is responding but returning 404 - likely deployment issue');
    } else if (response.status === 200) {
      console.log('   ✅ Server is responding correctly');
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    console.log('   💡 This could mean:');
    console.log('      - Backend is not deployed');
    console.log('      - Backend is down');
    console.log('      - URL is incorrect');
  }

  // Test 2: Check for common deployment patterns
  console.log('\n2️⃣ Testing common deployment patterns...');
  const patterns = [
    { path: '/', name: 'Root endpoint' },
    { path: '/api', name: 'API base' },
    { path: '/health', name: 'Health check' },
    { path: '/status', name: 'Status endpoint' },
    { path: '/ping', name: 'Ping endpoint' },
    { path: '/docs', name: 'Documentation' },
    { path: '/swagger', name: 'Swagger docs' },
    { path: '/api-docs', name: 'API docs' },
  ];

  for (const pattern of patterns) {
    try {
      const response = await fetch(`${API_BASE}${pattern.path}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Search-Optimizer-Frontend/1.0',
        },
      });
      
      if (response.ok) {
        console.log(`   ✅ ${pattern.name} (${pattern.path}): ${response.status}`);
      } else {
        console.log(`   ❌ ${pattern.name} (${pattern.path}): ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${pattern.name} (${pattern.path}): ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Test 3: Check for specific API endpoints
  console.log('\n3️⃣ Testing specific API endpoints...');
  const apiEndpoints = [
    '/products',
    '/auth/login',
    '/auth/register',
    '/cart',
    '/users',
    '/api/products',
    '/api/auth/login',
    '/api/cart',
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Search-Optimizer-Frontend/1.0',
        },
      });
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint}: ${response.status}`);
      } else if (response.status === 401) {
        console.log(`   🔐 ${endpoint}: ${response.status} (Authentication required)`);
      } else if (response.status === 404) {
        console.log(`   ❌ ${endpoint}: ${response.status} (Not found)`);
      } else {
        console.log(`   ⚠️  ${endpoint}: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Test 4: Check response headers for deployment info
  console.log('\n4️⃣ Checking deployment information...');
  try {
    const response = await fetch(API_BASE, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Search-Optimizer-Frontend/1.0',
      },
    });
    
    const headers = Object.fromEntries(response.headers.entries());
    console.log('   Response headers:');
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`      ${key}: ${value}`);
    });
  } catch (error) {
    console.log(`   ❌ Could not check headers: ${error.message}`);
  }

  // Summary and recommendations
  console.log('\n📋 Deployment Status Summary:');
  console.log('================================');
  console.log('🔍 Based on the tests above:');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('1. Go to your Render.com dashboard');
  console.log('2. Check if your backend service is:');
  console.log('   - Deployed (should show "Live" status)');
  console.log('   - Running (check logs for errors)');
  console.log('   - Configured correctly (environment variables, build settings)');
  console.log('');
  console.log('3. Common issues to check:');
  console.log('   - Build failures in deployment logs');
  console.log('   - Missing environment variables');
  console.log('   - Incorrect start command');
  console.log('   - Port configuration issues');
  console.log('   - Database connection problems');
  console.log('');
  console.log('4. If backend is working but endpoints are different:');
  console.log('   - Update the API configuration in src/config/api.js');
  console.log('   - Check your backend route definitions');
  console.log('');
  console.log('5. Your frontend is working perfectly with local data!');
  console.log('   - The app will automatically connect when backend is ready');
  console.log('   - No changes needed to the frontend code');
}

checkDeployment().catch(console.error); 