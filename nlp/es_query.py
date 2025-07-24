from elasticsearch import Elasticsearch, helpers

# Connect to local Elasticsearch instance
es = Elasticsearch("http://localhost:9200", verify_certs=False)

INDEX_NAME = 'products'

# Define a sample mapping for the product index (run once)
def create_index():
    if not es.indices.exists(index=INDEX_NAME):
        es.indices.create(
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
                        "discount": {"type": "integer"}
                    }
                }
            }
        )

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
    helpers.bulk(es, actions)

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
        should_clause.append({
            "multi_match": {
                "query": query_text,
                "fields": ["name^3", "description", "category"]
            }
        })

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

    es.indices.refresh(index=INDEX_NAME)  # Ensure docs are searchable
    res = es.search(index=INDEX_NAME, body=query_body)
    return [hit["_source"] for hit in res["hits"]["hits"]]

# For standalone testing
if __name__ == "__main__":
    if es.indices.exists(index=INDEX_NAME):
        es.indices.delete(index=INDEX_NAME)
    create_index()
    index_sample_data()
    es.indices.refresh(index=INDEX_NAME)

    print("Search for red sneakers for women below 1500:")
    results = search_products(
        category="shoe",
        color="red",
        gender="women",
        price_filter={"operator": "<", "value": 1500},
        query_text="red sneakers for women below 1500"
    )
    for r in results:
        print(r)
