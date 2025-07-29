# insert_sample_product.py
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
mongo_db = os.getenv("MONGO_DB")

client = MongoClient(mongo_uri)
db = client[mongo_db]
collection = db.products

# Sample product document
sample_product = {
    "name": "Black Puma Sneakers",
    "description": "Stylish black sneakers suitable for running and casual wear.",
    "category": "shoe",
    "brand": "puma",
    "color": "black",
    "gender": "men",
    "price": 2499,
    "rating": 4.4,
    "stock": 18,
    "discount": 10
}

result = collection.insert_one(sample_product)
print(f"✅ Sample product inserted with _id: {result.inserted_id}")