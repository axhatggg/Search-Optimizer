# data_loader.py
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from es_query import get_elasticsearch_client, create_index, bulk_index

def load_and_index():
    load_dotenv()  # Load environment variables from .env

    mongo_uri = os.getenv("MONGO_URI")
    mongo_db = os.getenv("MONGO_DB")
    es_index = os.getenv("ELASTICSEARCH_INDEX", "products")

    print(f"[INFO] Connecting to MongoDB at {mongo_uri}, database: {mongo_db}")
    mongo_client = MongoClient(mongo_uri)
    db = mongo_client[mongo_db]
    collection = db.products  # Update if your collection is named differently

    print(f"[INFO] Getting Elasticsearch client")
    es = get_elasticsearch_client()

    # Create index if it doesn't exist
    create_index()

    products = list(collection.find())
    print(f"[INFO] Found {len(products)} product(s) in MongoDB.\n")

    # Prepare bulk actions
    actions = []
    for idx, prod in enumerate(products, 1):
        doc = {
            "name": prod.get("name", prod.get("title", "")),  # Fallback to 'title' if 'name' missing
            "description": prod.get("description", ""),
            "category": prod.get("category", "").lower(),
            "brand": prod.get("brand", "").lower(),
            "color": prod.get("color", "").lower(),
            "gender": prod.get("gender", "").lower(),
            "price": int(prod.get("price", 0)),
            "rating": float(prod.get("rating", 0.0)),
            "stock": int(prod.get("stock", 0)),
            "discount": int(prod.get("discount", 0))
        }

        print(f"[{idx}/{len(products)}] Preparing product _id={prod.get('_id')} → name={doc.get('name')}")

        actions.append({
            "_index": es_index,
            "_source": doc
        })

    # Bulk index all documents
    print(f"\n[INFO] Bulk indexing {len(actions)} documents...")
    try:
        result = bulk_index(es, actions)
        print("✅ Bulk indexing completed successfully")
        print(f"Indexed: {result.get('items', [])}")
    except Exception as e:
        print(f"❌ Bulk indexing failed: {e}")

    print("\n✅ Data indexing complete.\n")

if __name__ == "__main__":
    load_and_index()