import os
import requests
import json
from urllib3 import disable_warnings
from urllib3.exceptions import InsecureRequestWarning

# Load Bonsai credentials
from nlp import config

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv not installed, skip loading .env file
    pass

# Disable SSL warnings
disable_warnings(InsecureRequestWarning)

class SimpleElasticsearch:
    def __init__(self, host, username, password):
        self.host = host.rstrip('/')
        self.auth = (username, password)
        self.session = requests.Session()
        self.session.auth = self.auth
        self.session.verify = False
        
    def _request(self, method, path, data=None):
        """Make HTTP request to Elasticsearch"""
        url = f"{self.host}{path}"
        headers = {"Content-Type": "application/json"}
        
        if data:
            data = json.dumps(data)
            
        response = self.session.request(method, url, data=data, headers=headers)
        
        if response.status_code >= 400:
            raise Exception(f"Elasticsearch error {response.status_code}: {response.text}")
            
        return response.json() if response.content else {}
    
    def ping(self):
        """Test connection"""
        try:
            self._request('GET', '/')
            return True
        except:
            return False
    
    def info(self):
        """Get cluster info"""
        return self._request('GET', '/')
    
    def index_exists(self, index):
        """Check if index exists"""
        try:
            self._request('HEAD', f'/{index}')
            return True
        except:
            return False
    
    def create_index(self, index, body=None):
        """Create index"""
        return self._request('PUT', f'/{index}', body)
    
    def delete_index(self, index):
        """Delete index"""
        return self._request('DELETE', f'/{index}')
    
    def index_document(self, index, body, doc_id=None):
        """Index a document"""
        if doc_id:
            return self._request('PUT', f'/{index}/_doc/{doc_id}', body)
        else:
            return self._request('POST', f'/{index}/_doc', body)
    
    def bulk(self, actions):
        """Bulk index documents"""
        bulk_data = []
        for action in actions:
            # Add action line
            action_line = {"index": {"_index": action["_index"]}}
            bulk_data.append(json.dumps(action_line))
            # Add source line
            bulk_data.append(json.dumps(action["_source"]))
        
        bulk_body = '\n'.join(bulk_data) + '\n'
        
        response = self.session.post(
            f"{self.host}/_bulk",
            data=bulk_body,
            headers={"Content-Type": "application/x-ndjson"},
            verify=False
        )
        
        return response.json()
    
    def search(self, index, body):
        """Search documents"""
        return self._request('POST', f'/{index}/_search', body)
    
    def refresh(self, index):
        """Refresh index"""
        return self._request('POST', f'/{index}/_refresh')

# Configuration for different environments
def get_elasticsearch_client():
    """
    Create Elasticsearch client based on environment configuration
    """
    es_host = os.getenv('ELASTICSEARCH_HOST', 'http://localhost:9200')
    es_username = os.getenv('ELASTICSEARCH_USERNAME')
    es_password = os.getenv('ELASTICSEARCH_PASSWORD')
    
    print(f"🔗 Connecting to: {es_host}")
    
    if es_username and es_password:
        # For hosted Elasticsearch with basic auth (like Bonsai)
        es = SimpleElasticsearch(es_host, es_username, es_password)
    else:
        # For local development, fall back to requests
        es = SimpleElasticsearch(es_host, '', '')
    
    # Test connection
    try:
        if es.ping():
            info = es.info()
            print(f"✅ Connected to Elasticsearch!")
            print(f"   Cluster: {info.get('cluster_name', 'Unknown')}")
            print(f"   Version: {info.get('version', {}).get('number', 'Unknown')}")
            return es
        else:
            raise Exception("Ping failed")
    except Exception as e:
        print(f"❌ Failed to connect to Elasticsearch: {e}")
        raise ConnectionError(f"Could not connect to Elasticsearch: {e}")

# Initialize Elasticsearch client
es = get_elasticsearch_client()

INDEX_NAME = os.getenv('ELASTICSEARCH_INDEX', 'products')

# Helper function to mimic the old helpers.bulk functionality
def bulk_index(es_client, actions):
    """Bulk index documents using our SimpleElasticsearch client"""
    return es_client.bulk(actions)

# Define a sample mapping for the product index (run once)
def create_index():
    if not es.index_exists(index=INDEX_NAME):
        es.create_index(
            index=INDEX_NAME,
            body={
                "settings": {
                    "number_of_shards": 1,
                    "number_of_replicas": 0
                },
                "mappings": {
                    "properties": {
                        "name": {"type": "text"},
                        "description": {"type": "text"},
                        "category": {"type": "keyword"},
                        "color": {"type": "keyword"},
                        "brand": {"type": "keyword"},
                        "gender": {"type": "keyword"},
                        "price": {"type": "integer"},
                        "rating": {"type": "float"},
                        "stock": {"type": "integer"},
                        "discount": {"type": "integer"},
                        "photo_links": {"type": "keyword"}
                    }
                }
            }
        )

#delete index
# Index sample data
def index_sample_data():
    def lower_dict(d):
        return {k: v.lower() if isinstance(v, str) else v for k, v in d.items()}

    products = [
        {
            "name": "Red Nike Sneakers",
            "description": "Comfortable red sneakers for jogging and sports.",
            "category": "shoe",
            "color": "red",
            "brand": "nike",
            "gender": "women",
            "price": 1400,
            "rating": 4.6,
            "stock": 10,
            "discount": 15
        },
        {
            "name": "Blue Adidas Shoes",
            "description": "Durable blue shoes with cushioned sole.",
            "category": "shoes",
            "color": "blue",
            "brand": "adidas",
            "gender": "men",
            "price": 2100,
            "rating": 4.2,
            "stock": 20,
            "discount": 10
        },
        {
            "name": "iPhone 12",
            "description": "Apple iPhone 12 with A14 Bionic chip.",
            "category": "smartphone",
            "color": "black",
            "brand": "apple",
            "gender": "unisex",
            "price": 50000,
            "rating": 4.8,
            "stock": 5,
            "discount": 5
        },
        {
            "name": "Pink Sparx Slippers",
            "description": "Lightweight pink slippers for casual wear.",
            "category": "slippers",
            "color": "pink",
            "brand": "sparx",
            "gender": "women",
            "price": 800,
            "rating": 4.0,
            "stock": 30,
            "discount": 20
        }
    ]

    products = [lower_dict(p) for p in products]
    actions = [
        {
            "_index": INDEX_NAME,
            "_source": product
        } for product in products
    ]
    bulk_index(es, actions)

# Updated search function with scoring + ranking
def search_products(category=None, color=None, brand=None, gender=None, price_filter=None, query_text=None):
    must_clauses = []

    if category:
        must_clauses.append({"term": {"category": category.lower()}})
    if color:
        must_clauses.append({"term": {"color": color.lower()}})
    if brand:
        must_clauses.append({"term": {"brand": brand.lower()}})
    if gender:
        must_clauses.append({"term": {"gender": gender.lower()}})
    if price_filter:
        op = price_filter.get("operator")
        if op == "between":
            must_clauses.append({"range": {"price": {"gte": price_filter["min"], "lte": price_filter["max"]}}})
        elif op == ">":
            must_clauses.append({"range": {"price": {"gt": price_filter["value"]}}})
        elif op == "<":
            must_clauses.append({"range": {"price": {"lt": price_filter["value"]}}})
        elif op == ">=":
            must_clauses.append({"range": {"price": {"gte": price_filter["value"]}}})
        elif op == "<=":
            must_clauses.append({"range": {"price": {"lte": price_filter["value"]}}})

    should_clause = []
    if query_text:
        # Add fuzzy matching for better handling of misspelled terms
        should_clause.extend([
            {
                "multi_match": {
                    "query": query_text,
                    "fields": ["name^3", "description", "category"],
                    "fuzziness": "AUTO",  # Enable fuzzy matching
                    "prefix_length": 2,    # Minimum prefix length for fuzzy matching
                    "max_expansions": 50   # Maximum number of terms to expand to
                }
            },
            {
                "multi_match": {
                    "query": query_text,
                    "fields": ["brand^2", "name^3"],
                    "fuzziness": "AUTO",
                    "prefix_length": 1,    # Lower prefix for brand matching
                    "max_expansions": 20
                }
            }
        ])

    query_body = {
        "query": {
            "bool": {
                "must": must_clauses,
                "should": should_clause,
                "minimum_should_match": 0
            }
        },
        "sort": [
            {"_score": "desc"},
            {"rating": "desc"},
            {"discount": "desc"},
            {"price": "asc"}
        ]
    }

    # 🔍 Debug: print final ES query
    # print("Elasticsearch Query:")
    # print(json.dumps(query_body, indent=2))

    es.refresh(index=INDEX_NAME)  # Ensure docs are searchable
    res = es.search(index=INDEX_NAME, body=query_body)
    return [hit["_source"] for hit in res["hits"]["hits"]]

# For standalone testing
if __name__ == "__main__":
    if es.index_exists(index=INDEX_NAME):
        es.delete_index(index=INDEX_NAME)
    create_index()
    index_sample_data()
    es.refresh(index=INDEX_NAME)

    print("Search for adidas shoes for women below 1500:")
    print("--------------------------------")
    print("Aksha1t")
    results = search_products(
        category="shoes",  # Changed from "shoe" to "shoes" to match Adidas
        color="",
        gender="",
        price_filter={"operator": "<", "value": 1500000},
        query_text="Adidas shoes below 1500000"
    )
    for r in results:
        print(r)