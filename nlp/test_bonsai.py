#!/usr/bin/env python3
"""
Simple test script to verify Bonsai Elasticsearch connection
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_configuration():
    """Test if configuration is properly set up"""
    print("🔍 Checking Bonsai Configuration...")
    print("-" * 50)
    
    # Check environment variables
    host = os.getenv('ELASTICSEARCH_HOST')
    api_key = os.getenv('ELASTICSEARCH_API_KEY')
    username = os.getenv('ELASTICSEARCH_USERNAME')
    password = os.getenv('ELASTICSEARCH_PASSWORD')
    verify_certs = os.getenv('ELASTICSEARCH_VERIFY_CERTS', 'true')
    
    print(f"Host: {host}")
    print(f"API Key: {'✅ Set' if api_key else '❌ Not set'}")
    print(f"Username: {'✅ Set' if username else '❌ Not set'}")
    print(f"Password: {'✅ Set' if password else '❌ Not set'}")
    print(f"SSL Verify: {verify_certs}")
    
    # Check if we have authentication
    has_auth = bool(api_key or (username and password))
    if not has_auth:
        print("\n❌ No authentication configured!")
        print("   Please set either ELASTICSEARCH_API_KEY or ELASTICSEARCH_USERNAME/PASSWORD")
        return False
    
    # Check if host is configured
    if not host or 'your-cluster-id' in host:
        print("\n❌ Host not properly configured!")
        print("   Please set ELASTICSEARCH_HOST to your actual Bonsai cluster URL")
        return False
    
    print("\n✅ Configuration looks good!")
    return True

def test_connection():
    """Test the actual connection to Bonsai"""
    print("\n🔗 Testing Bonsai Connection...")
    print("-" * 50)
    
    try:
        from es_query import es
        
        # Test ping
        if es.ping():
            print("✅ Connection successful!")
            
            # Get cluster info
            info = es.info()
            print(f"📊 Cluster: {info.get('cluster_name', 'Unknown')}")
            print(f"🔧 Version: {info.get('version', {}).get('number', 'Unknown')}")
            print(f"🌐 Node: {info.get('name', 'Unknown')}")
            
            return True
        else:
            print("❌ Ping failed!")
            return False
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("   1. Check your Bonsai credentials")
        print("   2. Verify your cluster is running")
        print("   3. Try setting ELASTICSEARCH_VERIFY_CERTS=false")
        print("   4. Check your network connection")
        return False

def test_basic_operations():
    """Test basic Elasticsearch operations"""
    print("\n🧪 Testing Basic Operations...")
    print("-" * 50)
    
    try:
        from es_query import es, INDEX_NAME
        
        # Test index creation
        print(f"📝 Creating test index: {INDEX_NAME}")
        if es.index_exists(index=INDEX_NAME):
            es.delete_index(index=INDEX_NAME)
        
        # Create index
        es.create_index(
            index=INDEX_NAME,
            body={
                "settings": {"number_of_shards": 1, "number_of_replicas": 0},
                "mappings": {
                    "properties": {
                        "name": {"type": "text"},
                        "description": {"type": "text"}
                    }
                }
            }
        )
        print("✅ Index created successfully")
        
        # Test document indexing
        print("📦 Indexing test document...")
        doc = {"name": "Test Product", "description": "This is a test product"}
        result = es.index_document(INDEX_NAME, doc)
        print(f"✅ Document indexed: {result.get('result', 'unknown')}")
        
        # Test search
        print("🔍 Testing search...")
        es.refresh(INDEX_NAME)
        search_result = es.search(INDEX_NAME, {"query": {"match_all": {}}})
        hits = search_result.get('hits', {}).get('hits', [])
        print(f"✅ Search successful: {len(hits)} documents found")
        
        # Clean up
        print("🧹 Cleaning up...")
        es.delete_index(INDEX_NAME)
        print("✅ Test index deleted")
        
        return True
        
    except Exception as e:
        print(f"❌ Operations failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Bonsai Elasticsearch Connection Test")
    print("=" * 50)
    
    # Test 1: Configuration
    if not test_configuration():
        print("\n❌ Configuration test failed!")
        sys.exit(1)
    
    # Test 2: Connection
    if not test_connection():
        print("\n❌ Connection test failed!")
        sys.exit(1)
    
    # Test 3: Basic operations
    if not test_basic_operations():
        print("\n❌ Operations test failed!")
        sys.exit(1)
    
    print("\n🎉 All tests passed! Your Bonsai connection is working correctly.")
    print("\nYou can now run your main application:")
    print("   python main.py")

if __name__ == "__main__":
    main() 