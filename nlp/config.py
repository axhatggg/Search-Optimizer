"""
Configuration settings for Elasticsearch deployment

Copy this file and set your environment variables or modify the values directly.
For production, use environment variables for security.
"""

import os

# === YOUR BONSAI ELASTICSEARCH CONFIGURATION ===
# URL: https://elastic-search-5895787911.us-east-1.bonsaisearch.net:443

# To get your Bonsai credentials:
# 1. Go to https://app.bonsai.io/
# 2. Click on your cluster
# 3. Go to "Credentials" tab  
# 4. Copy the username and password

# Set these environment variables:
# export ELASTICSEARCH_HOST="https://elastic-search-5895787911.us-east-1.bonsaisearch.net:443"
# export ELASTICSEARCH_USERNAME="your_bonsai_username"
# export ELASTICSEARCH_PASSWORD="your_bonsai_password"

# === ENVIRONMENT CONFIGURATION EXAMPLES ===

# For LOCAL DEVELOPMENT:
# Set ELASTICSEARCH_HOST=http://localhost:9200

# For ELASTIC CLOUD (Official):
# Set ELASTICSEARCH_CLOUD_ID=your-deployment-name:dXMtZWFzdC0xLmF3cy5lbGFzdGljLWNsb3VkLmNvbTo0NDMkYzlhN...
# Set ELASTICSEARCH_USERNAME=elastic
# Set ELASTICSEARCH_PASSWORD=your-password
# OR ELASTICSEARCH_API_KEY=your-api-key (recommended)

# For BONSAI ELASTICSEARCH (YOUR CURRENT SETUP):
# Set ELASTICSEARCH_HOST=https://elastic-search-5895787911.us-east-1.bonsaisearch.net:443
# Set ELASTICSEARCH_USERNAME=your-username
# Set ELASTICSEARCH_PASSWORD=your-password

# For SEARCHBOX (Heroku):
# Set ELASTICSEARCH_HOST=https://paas:password@your-cluster.searchbox.io

# Current configuration (modify as needed)
ELASTICSEARCH_CONFIG = {
    'host': os.getenv('ELASTICSEARCH_HOST', 'https://elastic-search-5895787911.us-east-1.bonsaisearch.net:443'),
    'username': os.getenv('ELASTICSEARCH_USERNAME'),
    'password': os.getenv('ELASTICSEARCH_PASSWORD'),
    'api_key': os.getenv('ELASTICSEARCH_API_KEY'),
    'cloud_id': os.getenv('ELASTICSEARCH_CLOUD_ID'),
    'index_name': os.getenv('ELASTICSEARCH_INDEX', 'products'),
    'verify_certs': os.getenv('ELASTICSEARCH_VERIFY_CERTS', 'true').lower() == 'true'
} 