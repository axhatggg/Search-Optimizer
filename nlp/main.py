# main.py
from es_query import create_index, index_sample_data, search_products, es, INDEX_NAME
from query_parser import parse_query

if __name__ == "__main__":
    # Clean up index for fresh run (development only)
    if es.index_exists(index=INDEX_NAME):
        print(f"🗑️  Deleting existing index: {INDEX_NAME}")
        es.delete_index(index=INDEX_NAME)
    
    create_index()
    index_sample_data()
    es.refresh(index=INDEX_NAME)

    # Example queries
    queries = [
        "Search for red sneakers for women below 1500:",
        "comfortable sneakers for sports",
        "durable blue running shoes",
        "shoes for women under 1500"
    ]

    for q in queries:
        print(f"Query: {q}")
        parsed = parse_query(q)
        print("Parsed:", parsed)

        # Safely extract values
        category = parsed.get("category")
        color_list = parsed.get("color") or [None]
        brand = parsed.get("brand")[0] if parsed.get("brand") else None
        gender = parsed.get("gender")
        price_filter = parsed.get("price_filter")

        def map_category(category):
            if not category:
                return None
            mapping = {
                "shoe": ["shoe", "shoes", "sneakers"],
                "phone": ["smartphone", "phone"],
                # add more mappings as needed
            }
            return mapping.get(category, [category])

        def map_brand(brand):
            if not brand:
                return None
            mapping = {
                "iphone": ["apple", "iphone"],
                # add more mappings as needed
            }
            return mapping.get(brand, [brand])

        category_list = map_category(category)
        brand_list = map_brand(brand) if brand else [None]

        results = []
        for cat in category_list or [None]:
            for br in brand_list or [None]:
                for col in color_list or [None]:
                    res = search_products(
                        category=cat,
                        color=col,
                        brand=br,
                        gender=gender,
                        price_filter=price_filter,
                        query_text=q
                    )
                    results.extend(res)

        # Remove duplicates (optional)
        unique_results = [dict(t) for t in {tuple(d.items()) for d in results}]
        print("Search Results:")
        for r in unique_results:
            print(r)
        print("-" * 40)
