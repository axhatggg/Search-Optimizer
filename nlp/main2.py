from fastapi import FastAPI, HTTPException, Query
from dotenv import load_dotenv
import os
from nlp.query_parser import parse_query, update_lists_from_product, RAW_CATEGORIES, COLORS, BRANDS, GENDERS
from nlp.es_query import search_products, INDEX_NAME, es
from pydantic import BaseModel
from typing import Optional
import spacy
from fastapi.middleware.cors import CORSMiddleware


# Load config
load_dotenv()

nlp = spacy.load("en_core_web_sm")

def lemmatize(text: str) -> str:
    return " ".join([token.lemma_ for token in nlp(text.lower()) if not token.is_punct and not token.is_space])

# Product model for the API
class Product(BaseModel):
    name: str
    description: Optional[str] = ""
    category: Optional[str] = ""
    brand: Optional[str] = ""
    color: Optional[str] = ""
    gender: Optional[str] = ""
    price: float
    rating: Optional[float] = 0.0
    stock: Optional[int] = 0
    discount: Optional[int] = 0
    photo_links: Optional[list[str]] = []

app = FastAPI()

# Allow all origins for now (for testing/development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <- Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
async def search(q: str = Query(..., min_length=1)):
    """
    Search endpoint using query parser + Elasticsearch.
    Example: /search?q=blue%20nike%20shoes%20under%2050
    """
    filters = parse_query(q)

    try:
        print(filters)
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

@app.post("/add-product")
async def add_product(product: Product):
    """
    Add a single product to Elasticsearch using lemmatized fields,
    but stored in the standard format (no *_lemma keys).
    """
    try:
        # Load and lemmatize fields
        def lemmatize(text: str) -> str:
            return " ".join([token.lemma_ for token in nlp(text.lower()) if not token.is_punct and not token.is_space])

        name = lemmatize(product.name)
        description = lemmatize(product.description or "")
        category = lemmatize(product.category) if product.category else ""
        brand = lemmatize(product.brand) if product.brand else ""
        color = lemmatize(product.color) if product.color else ""
        gender = product.gender.lower() if product.gender else ""

        doc = {
            "name": name,
            "description": description,
            "category": category,
            "brand": brand,
            "color": color,
            "gender": gender,
            "price": product.price,
            "rating": product.rating,
            "stock": product.stock,
            "discount": product.discount,
            "photo_links": product.photo_links
        }

        # Update vocab lists using lemmatized values
        update_lists_from_product(doc)

        # Index in Elasticsearch
        result = es.index_document(index=INDEX_NAME, body=doc)
        es.refresh(index=INDEX_NAME)

        return {
            "message": "Product added successfully",
            "product_id": result.get("_id"),
            "result": result.get("result"),
            "updated_lists": {
                "categories": len(RAW_CATEGORIES),
                "colors": len(COLORS),
                "brands": len(BRANDS),
                "genders": len(GENDERS)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/debug")
async def debug():
    query = {
        "query": {
            "match_all": {}
        }
    }
    res = es.search(index=INDEX_NAME, body=query)
    return res["hits"]["hits"]

@app.get("/lists")
async def get_lists():
    """
    Get current category, color, brand, and gender lists.
    """
    return {
        "categories": RAW_CATEGORIES,
        "colors": COLORS,
        "brands": BRANDS,
        "genders": GENDERS
    }
