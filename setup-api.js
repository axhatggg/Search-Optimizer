#!/usr/bin/env node

/**
 * API Setup Script for Search Optimizer
 * This script helps you configure your backend API connection
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔗 Search Optimizer API Setup\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAPI() {
  try {
    // Get API URL
    const apiUrl = await question('Enter your backend API URL (e.g., http://localhost:3000/api): ');
    
    if (!apiUrl) {
      console.log('❌ API URL is required!');
      process.exit(1);
    }

    // Validate URL format
    try {
      new URL(apiUrl);
    } catch (error) {
      console.log('❌ Invalid URL format!');
      process.exit(1);
    }

    // Create .env file
    const envContent = `# API Configuration
VITE_API_URL=${apiUrl}

# Optional: Other environment variables
VITE_APP_NAME=Search Optimizer
VITE_APP_VERSION=1.0.0

# Development settings
VITE_DEBUG=true
`;

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ API configuration created successfully!');
    console.log(`📁 Environment file: ${envPath}`);
    console.log(`🌐 API URL: ${apiUrl}`);

    // Test API connection
    console.log('\n🧪 Testing API connection...');
    
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        console.log('✅ API is accessible!');
      } else {
        console.log('⚠️  API responded but health check failed');
      }
    } catch (error) {
      console.log('⚠️  Could not connect to API (this is normal if your backend is not running yet)');
      console.log('   Make sure your backend is running and accessible');
    }

    // Next steps
    console.log('\n📋 Next Steps:');
    console.log('1. Start your backend API server');
    console.log('2. Run: npm run dev');
    console.log('3. Open http://localhost:8080 in your browser');
    console.log('4. Check the browser console for any API connection issues');

    console.log('\n📚 For more information, see: API_INTEGRATION.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️  Node.js 18+ is required for API testing');
  console.log('   Install Node.js 18+ or skip the API test');
}

setupAPI(); 