# 🔗 API Integration Guide

This guide will help you connect your Search Optimizer frontend to your backend API.

## 📋 Prerequisites

- Your backend API is running and accessible
- Your API supports the endpoints listed below
- CORS is properly configured on your backend

## 🚀 Quick Setup

### 1. Set Your API URL

Create a `.env` file in the root directory:

```bash
# .env
VITE_API_URL=http://localhost:3000/api
```

Replace `http://localhost:3000/api` with your actual API base URL.

### 2. API Endpoints Required

Your backend should implement these endpoints:

#### Authentication
```
POST /auth/login
POST /auth/register  
POST /auth/logout
POST /auth/refresh
GET  /auth/profile
```

#### Products
```
GET  /products
GET  /products/:id
GET  /products/search?q=query
GET  /products/category/:category
GET  /products/featured
GET  /products/best-sellers
GET  /products/new-arrivals
POST /products/:id/ratings
```

#### Cart
```
GET    /cart
POST   /cart
PUT    /cart/:id
DELETE /cart/:id
DELETE /cart
GET    /cart/summary
POST   /cart/coupon
```

#### Wishlist
```
GET    /wishlist
POST   /wishlist
DELETE /wishlist/:id
POST   /wishlist/:id/move-to-cart
```

#### Orders
```
GET  /orders
POST /orders
GET  /orders/:id
PUT  /orders/:id
```

#### User
```
GET  /user/profile
PUT  /user/profile
GET  /user/orders
GET  /user/addresses
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Your data here
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Authentication Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name"
    },
    "token": "jwt_token_here"
  }
}
```

## 🔧 Configuration

### Update API Base URL

Edit `src/config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://your-api-url.com/api',
  // ... other config
};
```

### Customize Endpoints

If your API uses different endpoint paths, update them in `src/services/api.js`:

```javascript
export const API_ENDPOINTS = {
  LOGIN: '/your-login-endpoint',
  PRODUCTS: '/your-products-endpoint',
  // ... customize as needed
};
```

## 🛡️ Authentication

The frontend expects JWT token-based authentication:

1. **Login**: Send credentials, receive token
2. **Token Storage**: Automatically stored in localStorage
3. **Request Headers**: Token automatically included in API requests
4. **Token Refresh**: Automatic token refresh when needed

### Token Format
```javascript
// Request headers
{
  'Authorization': 'Bearer your_jwt_token_here',
  'Content-Type': 'application/json'
}
```

## 🔄 Fallback Behavior

The frontend includes intelligent fallback behavior:

- **API Available**: Uses real API data
- **API Unavailable**: Falls back to local data
- **Network Errors**: Graceful degradation with user feedback
- **Authentication**: Local state management when API is down

## 🧪 Testing Your API

### 1. Health Check
```bash
curl http://your-api-url.com/api/health
```

### 2. Test Authentication
```bash
curl -X POST http://your-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Test Products
```bash
curl http://your-api-url.com/api/products
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your backend allows requests from your frontend domain
   - Add proper CORS headers

2. **Authentication Issues**
   - Check token format and expiration
   - Verify JWT secret matches between frontend/backend

3. **API Not Found**
   - Verify API base URL is correct
   - Check if your backend is running
   - Ensure endpoint paths match

4. **Data Format Mismatch**
   - Check response format matches expected structure
   - Verify field names match frontend expectations

### Debug Mode

Enable debug logging by setting:

```javascript
// In src/config/api.js
VITE_DEBUG=true
```

This will log all API requests and responses to the console.

## 📱 Features

### ✅ Implemented
- User authentication (login/register/logout)
- Product browsing and search
- Shopping cart management
- Wishlist functionality
- Product ratings
- User profile management
- Order management
- Responsive design
- Offline fallback

### 🔄 Real-time Features
- Live cart updates
- Real-time product search
- Dynamic filtering
- Instant feedback

## 🚀 Deployment

### Environment Variables
```bash
# Production
VITE_API_URL=https://your-production-api.com/api
VITE_DEBUG=false

# Development
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
```

### Build and Deploy
```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your API endpoints are working
3. Test with curl or Postman
4. Check network tab for failed requests
5. Ensure CORS is properly configured

## 🔗 Example Backend Integration

Here's a simple Express.js example:

```javascript
// Example backend structure
app.post('/api/auth/login', async (req, res) => {
  // Your login logic
  res.json({
    success: true,
    data: {
      user: { id: 1, email: req.body.email },
      token: 'jwt_token'
    }
  });
});

app.get('/api/products', async (req, res) => {
  // Your products logic
  res.json({
    success: true,
    data: {
      products: [
        // Your products array
      ]
    }
  });
});
```

Your frontend is now ready to connect to any backend API that follows these conventions! 