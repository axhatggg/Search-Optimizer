from fastapi import FastAPI, HTTPException, Query
from dotenv import load_dotenv
import os
from elasticsearch import Elasticsearch
from query_parser import parse_query
from es_query import search_products  

# Load config
load_dotenv()
es_host = os.getenv("ES_HOST", "http://localhost:9200")
es_index = os.getenv("ES_INDEX", "products")

# Init
es = Elasticsearch(es_host)
# parser = QueryParser(synonyms_file="synonym.json")
app = FastAPI()

@app.get("/search")
async def search(q: str = Query(..., min_length=1)):
    """
    Search endpoint using query parser + Elasticsearch.
    Example: /search?q=blue%20nike%20shoes%20under%2050
    """
    filters = parse_query(q)

    try:
        results = search_products(
            category=filters.get("category"),
            color=filters.get("color"),
            brand=filters.get("brand"),
            gender=filters.get("gender"),
            price_filter={
                "operator": "between",
                "min": filters["price_min"],
                "max": filters["price_max"]
            } if filters["price_min"] is not None and filters["price_max"] is not None else (
                {"operator": ">=", "value": filters["price_min"]} if filters["price_min"] is not None else (
                    {"operator": "<=", "value": filters["price_max"]} if filters["price_max"] is not None else None
                )
            ),
            query_text=" ".join(filters["keywords"]) if filters["keywords"] else None
        )
        return {"total": len(results), "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
