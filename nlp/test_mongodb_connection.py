#!/usr/bin/env python3
"""
Test script to verify MongoDB connection and show sample data
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

def test_mongodb_connection():
    """Test MongoDB connection and show sample data"""
    
    # MongoDB connection details
    MONGO_URI = "mongodb+srv://faiqueofficial695:newpwd123@cluster0.fsvyahj.mongodb.net"
    DATABASE_NAME = "MyDatabase"  # Change this to your actual database name
    COLLECTION_NAME = "products"  # Change this to your actual collection name
    
    print("🔗 Testing MongoDB connection...")
    print(f"📊 Database: {DATABASE_NAME}")
    print(f"📋 Collection: {COLLECTION_NAME}")
    print("-" * 50)
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # Test the connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # Get database and collection
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]
        
        # Count documents
        total_docs = collection.count_documents({})
        print(f"📈 Total documents in collection: {total_docs}")
        
        if total_docs == 0:
            print("⚠️ No documents found in the collection.")
            print("💡 Please check if the database and collection names are correct.")
            return False
        
        # Show sample documents
        print("\n📋 Sample documents:")
        print("-" * 30)
        
        sample_docs = list(collection.find().limit(3))
        for i, doc in enumerate(sample_docs, 1):
            print(f"\n📄 Document {i}:")
            # Remove _id for cleaner output
            doc_copy = doc.copy()
            if '_id' in doc_copy:
                del doc_copy['_id']
            for key, value in doc_copy.items():
                print(f"   {key}: {value}")
        
        print(f"\n✅ MongoDB connection test successful!")
        print(f"📊 Found {total_docs} documents in the collection")
        
        return True
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("💡 Please check your MongoDB URI and network connection")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()
            print("🔌 MongoDB connection closed")

if __name__ == "__main__":
    test_mongodb_connection() 