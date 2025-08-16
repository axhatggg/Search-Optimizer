#!/usr/bin/env node

/**
 * Backend Deployment Helper Script
 * This script helps you import and deploy your backend from GitHub to Render.com
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

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function deployBackend() {
  console.log('🚀 Search Optimizer Backend Deployment Helper\n');
  
  try {
    // Step 1: Get GitHub repository information
    console.log('1️⃣ GitHub Repository Setup');
    console.log('==========================');
    
    const githubRepo = await question('Enter your GitHub repository URL (e.g., https://github.com/username/search-optimizer-backend): ');
    
    if (!githubRepo) {
      console.log('❌ GitHub repository URL is required!');
      process.exit(1);
    }

    // Extract repository name and owner
    const repoMatch = githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      console.log('❌ Invalid GitHub repository URL!');
      process.exit(1);
    }

    const [, owner, repo] = repoMatch;
    console.log(`✅ Repository: ${owner}/${repo}`);

    // Step 2: Check if backend code exists locally
    console.log('\n2️⃣ Local Backend Code Check');
    console.log('==========================');
    
    const backendDir = path.join(__dirname, '..', 'backend');
    const backendExists = fs.existsSync(backendDir);
    
    if (backendExists) {
      console.log('✅ Backend directory found locally');
      const useLocal = await question('Use local backend code? (y/n): ');
      if (useLocal.toLowerCase() === 'y') {
        console.log('📁 Using local backend code');
      } else {
        console.log('📥 Will clone from GitHub');
      }
    } else {
      console.log('📥 Backend directory not found locally - will clone from GitHub');
    }

    // Step 3: Render.com deployment guide
    console.log('\n3️⃣ Render.com Deployment Guide');
    console.log('==============================');
    
    console.log('\n📋 Follow these steps to deploy your backend:');
    console.log('');
    console.log('1. Go to https://render.com and sign in');
    console.log('2. Click "New +" and select "Web Service"');
    console.log('3. Connect your GitHub account if not already connected');
    console.log('4. Select your repository: ' + repo);
    console.log('');
    console.log('5. Configure your service:');
    console.log('   - Name: search-optimizer-backend');
    console.log('   - Environment: Node');
    console.log('   - Build Command: npm install');
    console.log('   - Start Command: npm start');
    console.log('');
    console.log('6. Environment Variables (add these):');
    console.log('   - NODE_ENV=production');
    console.log('   - PORT=10000 (Render will set this automatically)');
    console.log('   - Add any other environment variables your backend needs');
    console.log('');
    console.log('7. Click "Create Web Service"');
    console.log('');

    // Step 4: Backend code requirements
    console.log('4️⃣ Backend Code Requirements');
    console.log('============================');
    
    console.log('\nYour backend should have these files:');
    console.log('✅ package.json - with start script');
    console.log('✅ server.js or index.js - main server file');
    console.log('✅ .env.example - environment variables template');
    console.log('✅ README.md - deployment instructions');
    console.log('');

    // Step 5: Required endpoints
    console.log('5️⃣ Required API Endpoints');
    console.log('==========================');
    
    console.log('\nYour backend should implement these endpoints:');
    console.log('GET  / - Health check');
    console.log('GET  /products - Get all products');
    console.log('POST /products - Create product');
    console.log('GET  /products/:id - Get product by ID');
    console.log('PUT  /products/:id - Update product');
    console.log('DELETE /products/:id - Delete product');
    console.log('');
    console.log('POST /auth/login - User login');
    console.log('POST /auth/register - User registration');
    console.log('GET  /auth/profile - Get user profile');
    console.log('');
    console.log('GET  /cart - Get user cart');
    console.log('POST /cart - Add to cart');
    console.log('PUT  /cart/:id - Update cart item');
    console.log('DELETE /cart/:id - Remove from cart');
    console.log('');

    // Step 6: Create backend template
    console.log('6️⃣ Backend Code Template');
    console.log('=========================');
    
    const createTemplate = await question('Create a basic backend template? (y/n): ');
    
    if (createTemplate.toLowerCase() === 'y') {
      const templateDir = path.join(__dirname, 'backend-template');
      
      if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
      }

      // Create package.json
      const packageJson = {
        name: "search-optimizer-backend",
        version: "1.0.0",
        description: "Search Optimizer Backend API",
        main: "server.js",
        scripts: {
          start: "node server.js",
          dev: "nodemon server.js",
          test: "echo \"Error: no test specified\" && exit 1"
        },
        dependencies: {
          "express": "^4.18.2",
          "cors": "^2.8.5",
          "dotenv": "^16.3.1",
          "helmet": "^7.1.0",
          "morgan": "^1.10.0"
        },
        devDependencies: {
          "nodemon": "^3.0.2"
        },
        keywords: ["api", "search", "optimizer"],
        author: "Your Name",
        license: "MIT"
      };

      fs.writeFileSync(
        path.join(templateDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Create server.js
      const serverJs = `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Search Optimizer API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Sample products data
let products = [
  {
    id: 1,
    name: 'Sample Product 1',
    price: 29.99,
    category: 'Electronics',
    description: 'A sample product for testing',
    image: 'https://via.placeholder.com/300x200',
    isNew: true,
    isSale: false,
    userRatings: []
  }
];

// Products routes
app.get('/products', (req, res) => {
  res.json({ products });
});

app.post('/products', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    ...req.body,
    userRatings: []
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Auth routes (placeholder)
app.post('/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint - implement authentication' });
});

app.post('/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint - implement registration' });
});

// Cart routes (placeholder)
app.get('/cart', (req, res) => {
  res.json({ message: 'Cart endpoint - implement cart logic' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📡 Health check: http://localhost:\${PORT}/\`);
});
`;

      fs.writeFileSync(path.join(templateDir, 'server.js'), serverJs);

      // Create .env.example
      const envExample = `# Environment Variables
NODE_ENV=production
PORT=3000

# Database (add your database URL)
# DATABASE_URL=your_database_url_here

# JWT Secret (for authentication)
# JWT_SECRET=your_jwt_secret_here

# Other configuration
CORS_ORIGIN=*
`;

      fs.writeFileSync(path.join(templateDir, '.env.example'), envExample);

      // Create README.md
      const readme = `# Search Optimizer Backend

A Node.js/Express API for the Search Optimizer application.

## Features

- Product management
- User authentication
- Shopping cart functionality
- RESTful API design

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Production

\`\`\`bash
npm start
\`\`\`

## API Endpoints

- GET / - Health check
- GET /products - Get all products
- POST /products - Create product
- GET /products/:id - Get product by ID
- POST /auth/login - User login
- POST /auth/register - User registration
- GET /cart - Get user cart

## Deployment

This backend is designed to be deployed on Render.com.

1. Connect your GitHub repository
2. Set environment variables
3. Deploy as a Web Service

## Environment Variables

- NODE_ENV - Environment (production/development)
- PORT - Server port (set automatically by Render)
- DATABASE_URL - Database connection string
- JWT_SECRET - JWT signing secret
`;

      fs.writeFileSync(path.join(templateDir, 'README.md'), readme);

      console.log('✅ Backend template created in: ' + templateDir);
      console.log('📁 Files created:');
      console.log('   - package.json');
      console.log('   - server.js');
      console.log('   - .env.example');
      console.log('   - README.md');
    }

    // Step 7: Next steps
    console.log('\n7️⃣ Next Steps');
    console.log('==============');
    
    console.log('\n📋 After deploying to Render.com:');
    console.log('1. Wait for deployment to complete');
    console.log('2. Copy your Render.com URL');
    console.log('3. Update your frontend .env file:');
    console.log('   VITE_API_URL=https://your-app-name.onrender.com');
    console.log('4. Test the connection with: node test-api.js');
    console.log('5. Your frontend will automatically connect!');
    console.log('');

    console.log('🎉 Your Search Optimizer will be fully functional!');
    console.log('   - Frontend: http://localhost:8080');
    console.log('   - Backend: https://your-app-name.onrender.com');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

deployBackend(); 