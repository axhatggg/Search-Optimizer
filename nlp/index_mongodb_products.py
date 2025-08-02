#!/usr/bin/env python3
"""
Script to load products from MongoDB and index them in Elasticsearch
"""

import os

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️ python-dotenv not installed, skipping .env file loading")
    pass

from data_loader import load_and_index_products_from_mongodb

def main():
    """Main function to run the indexing process"""
    
    # MongoDB connection details
    MONGO_URI = "mongodb+srv://faiqueofficial695:newpwd123@cluster0.fsvyahj.mongodb.net"
    
    # You can customize these parameters
    DATABASE_NAME = "MyDatabase"  # Change to your actual database name
    COLLECTION_NAME = "products"  # Change to your actual collection name
    LIMIT = None  # Set to a number (e.g., 100) to limit products, or None for all
    
    print("🚀 Starting MongoDB to Elasticsearch indexing process...")
    print(f"📊 Database: {DATABASE_NAME}")
    print(f"📋 Collection: {COLLECTION_NAME}")
    print(f"📈 Limit: {LIMIT if LIMIT else 'All products'}")
    print("-" * 50)
    
    # Run the indexing process
    success = load_and_index_products_from_mongodb(
        mongo_uri=MONGO_URI,
        database_name=DATABASE_NAME,
        collection_name=COLLECTION_NAME,
        limit=LIMIT
    )
    
    if success:
        print("\n🎉 SUCCESS: Products have been successfully indexed in Elasticsearch!")
        print("✅ You can now use the search functionality with your real product data.")
    else:
        print("\n❌ FAILED: There was an error during the indexing process.")
        print("🔍 Please check the error messages above and verify your configuration.")

if __name__ == "__main__":
    main() 