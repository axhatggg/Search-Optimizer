import os
ELASTICSEARCH_CONFIG = {
    'host': os.getenv('ELASTICSEARCH_HOST', 'https://elastic-search-5895787911.us-east-1.bonsaisearch.net:443'),
    'username': os.getenv('ELASTICSEARCH_USERNAME'),
    'password': os.getenv('ELASTICSEARCH_PASSWORD'),
    'api_key': os.getenv('ELASTICSEARCH_API_KEY'),
    'cloud_id': os.getenv('ELASTICSEARCH_CLOUD_ID'),
    'index_name': os.getenv('ELASTICSEARCH_INDEX', 'products'),
    'verify_certs': os.getenv('ELASTICSEARCH_VERIFY_CERTS', 'true').lower() == 'true'
} 