# data_loader.py
import os
import json
from typing import List, Dict, Any
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️ python-dotenv not installed, skipping .env file loading")
    pass

# Import Elasticsearch client
from es_query import es, INDEX_NAME, bulk_index

class MongoDBLoader:
    def __init__(self, mongo_uri: str, database_name: str = "ecommerce", collection_name: str = "products"):
        """
        Initialize MongoDB loader
        
        Args:
            mongo_uri: MongoDB connection string
            database_name: Name of the database
            collection_name: Name of the collection containing products
        """
        self.mongo_uri = mongo_uri
        self.database_name = database_name
        self.collection_name = collection_name
        self.client = None
        self.db = None
        self.collection = None
        
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            print(f"🔗 Connecting to MongoDB...")
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            
            # Test the connection
            self.client.admin.command('ping')
            print("✅ Successfully connected to MongoDB!")
            
            self.db = self.client[self.database_name]
            self.collection = self.db[self.collection_name]
            
            return True
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error connecting to MongoDB: {e}")
            return False
    
    def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("🔌 MongoDB connection closed")
    
    def fetch_products(self, limit: int = None) -> List[Dict[str, Any]]:
        """
        Fetch products from MongoDB
        
        Args:
            limit: Maximum number of products to fetch (None for all)
            
        Returns:
            List of product dictionaries
        """
        if self.collection is None:
            print("❌ Not connected to MongoDB. Call connect() first.")
            return []
        
        try:
            print(f"📥 Fetching products from MongoDB collection: {self.collection_name}")
            
            # Build query
            query = {}
            cursor = self.collection.find(query)
            
            if limit:
                cursor = cursor.limit(limit)
            
            products = list(cursor)
            print(f"✅ Fetched {len(products)} products from MongoDB")
            
            return products
            
        except Exception as e:
            print(f"❌ Error fetching products from MongoDB: {e}")
            return []
    
    def transform_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform MongoDB product to Elasticsearch format
        """
        from bson import ObjectId
        from datetime import datetime

        def convert_types(obj):
            """Recursively convert ObjectIds to strings and datetime to ISO strings"""
            if isinstance(obj, dict):
                return {key: convert_types(value) for key, value in obj.items()}
            elif isinstance(obj, list):
                return [convert_types(item) for item in obj]
            elif isinstance(obj, ObjectId):
                return str(obj)
            elif isinstance(obj, datetime):
                return obj.isoformat()
            else:
                return obj

        # Apply conversion
        transformed = convert_types(product)

        # Remove _id field as it's a metadata field in Elasticsearch
        if '_id' in transformed:
            del transformed['_id']

        # Convert string values to lowercase
        string_fields = ['name', 'description', 'category', 'color', 'brand', 'gender']
        for field in string_fields:
            if field in transformed and isinstance(transformed[field], str):
                transformed[field] = transformed[field].lower()

        # Ensure price is numeric
        if 'price' in transformed:
            try:
                transformed['price'] = float(transformed['price'])
            except (ValueError, TypeError):
                transformed['price'] = 0.0

        # Rename count to stock
        if 'count' in transformed:
            try:
                transformed['stock'] = int(transformed['count'])
                del transformed['count']
            except (ValueError, TypeError):
                transformed['stock'] = 0

        # Default values
        if 'rating' not in transformed:
            transformed['rating'] = 4.0
        if 'discount' not in transformed:
            transformed['discount'] = 0
        if 'stock' not in transformed:
            transformed['stock'] = 0

        return transformed

    
    def index_products_to_elasticsearch(self, products: List[Dict[str, Any]]) -> bool:
        """
        Index products to Elasticsearch
        
        Args:
            products: List of products to index
            
        Returns:
            True if successful, False otherwise
        """
        if not products:
            print("⚠️ No products to index")
            return False
        
        try:
            print(f"📤 Indexing {len(products)} products to Elasticsearch...")
            
            # Transform products
            transformed_products = [self.transform_product(product) for product in products]
            
            # Prepare bulk actions
            actions = [
                {
                    "_index": INDEX_NAME,
                    "_source": product
                } for product in transformed_products
            ]
            
            # Bulk index
            result = bulk_index(es, actions)
            
            # Check for errors
            if result.get('errors', False):
                print("❌ Some documents failed to index:")
                for item in result.get('items', []):
                    if 'index' in item and item['index'].get('error'):
                        print(f"   Error: {item['index']['error']}")
                return False
            
            print(f"✅ Successfully indexed {len(products)} products to Elasticsearch")
            return True
            
        except Exception as e:
            print(f"❌ Error indexing products to Elasticsearch: {e}")
            return False

def load_and_index_products_from_mongodb(
    mongo_uri: str,
    database_name: str = "ecommerce",
    collection_name: str = "products",
    limit: int = None
) -> bool:
    """
    Main function to load products from MongoDB and index them in Elasticsearch
    
    Args:
        mongo_uri: MongoDB connection string
        database_name: Name of the database
        collection_name: Name of the collection
        limit: Maximum number of products to process (None for all)
        
    Returns:
        True if successful, False otherwise
    """
    loader = MongoDBLoader(mongo_uri, database_name, collection_name)
    
    try:
        # Connect to MongoDB
        if not loader.connect():
            return False
        
        # Fetch products
        products = loader.fetch_products(limit)
        if not products:
            print("❌ No products found in MongoDB")
            return False
        
        # Index to Elasticsearch
        success = loader.index_products_to_elasticsearch(products)
        
        return success
        
    finally:
        # Always disconnect
        loader.disconnect()

# Example usage
if __name__ == "__main__":
    # Your MongoDB URI
    MONGO_URI = "mongodb+srv://faiqueofficial695:newpwd123@cluster0.fsvyahj.mongodb.net"
    
    # Load and index products
    success = load_and_index_products_from_mongodb(
        mongo_uri=MONGO_URI,
        database_name="ecommerce",  # Change this to your actual database name
        collection_name="products",  # Change this to your actual collection name
        limit=100  # Set to None to process all products
    )
    
    if success:
        print("🎉 Successfully loaded and indexed products!")
    else:
        print("❌ Failed to load and index products")