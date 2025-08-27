import spacy
import re
import json
import os
from rapidfuzz import process, fuzz

nlp = spacy.load("en_core_web_sm")

# Get absolute path to synonym.json
base_dir = os.path.dirname(__file__)
synonym_path = os.path.join(base_dir, "synonym.json")

# Load synonyms from JSON safely
with open(synonym_path, "r") as f:
    synonym_data = json.load(f)


SYNONYM_MAP = synonym_data  # expects 'categories', 'brands', etc.

MULTIWORD_SYNONYM_PATTERNS = [
    (r"smart phones?", "smartphone"),
    (r"running shoes?", "sports shoes"),
    (r"snikers?", "sneakers"),  # Handle common misspelling
    (r"snickers?", "sneakers"),  # Another common misspelling
    (r"lnovo", "lenovo"),  # Handle common misspelling
    (r"lenovo", "lenovo"),  # Keep original
    (r"nike", "nike"),  # Keep original
    (r"adidas", "adidas"),  # Keep original
    (r"puma", "puma")  # Keep original
]

# Global lists that can be updated
RAW_CATEGORIES = ["shoes", "sandals", "boots", "heels", "flats", "slippers", "phone", "phones", "mobile", "smartphone", "earphone", "sneakers", "trainers", "footwear", "sneaker", "shoe", "laptop", "laptops", "computer", "computers"]
COLORS = ["red", "blue", "black", "white", "green", "yellow", "pink", "brown", "grey", "orange", "purple"]
GENDERS = ["men", "women", "boys", "girls", "unisex"]
BRANDS = ["nike", "adidas", "puma", "reebok", "skechers", "new balance", "asics", "fila", "converse", "vans", "woodland", "red tape", "bata", "h&m", "zara", "campus", "sparx", "crocs", "iphone", "samsung", "apple", "xiaomi", "oneplus", "oppo", "vivo", "lenovo", "dell", "hp", "asus"]

# New: setter/getter utilities to make lists dynamic

def _normalize_list(values):
    if not values:
        return []
    # Lowercase, trim, deduplicate while preserving order
    seen = set()
    normalized = []
    for v in values:
        if not isinstance(v, str):
            continue
        item = v.strip().lower()
        if item and item not in seen:
            seen.add(item)
            normalized.append(item)
    return normalized


def set_vocab_lists(raw_categories=None, colors=None, brands=None, genders=None):
    """Replace in-memory vocab lists and recompute lemmatized categories.
    Any None argument will keep the current list unchanged.
    """
    global RAW_CATEGORIES, COLORS, BRANDS, GENDERS, CATEGORIES

    if raw_categories is not None:
        RAW_CATEGORIES = _normalize_list(raw_categories)
    if colors is not None:
        COLORS = _normalize_list(colors)
    if brands is not None:
        BRANDS = _normalize_list(brands)
    if genders is not None:
        GENDERS = _normalize_list(genders)

    # Recompute lemmatized categories based on raw categories
    CATEGORIES = lemmatize_list(RAW_CATEGORIES)


def get_vocab_state():
    """Return a snapshot of current vocab lists."""
    return {
        "categories": list(RAW_CATEGORIES),
        "colors": list(COLORS),
        "brands": list(BRANDS),
        "genders": list(GENDERS)
    }

def add_to_categories(category):
    """Add a new category to the list if not already present"""
    if category and category.lower() not in [cat.lower() for cat in RAW_CATEGORIES]:
        RAW_CATEGORIES.append(category.lower())
        # Update the lemmatized categories
        global CATEGORIES
        CATEGORIES = lemmatize_list(RAW_CATEGORIES)
        print(f"✅ Added category: {category}")

def add_to_colors(color):
    """Add a new color to the list if not already present"""
    if color and color.lower() not in [col.lower() for col in COLORS]:
        COLORS.append(color.lower())
        print(f"✅ Added color: {color}")

def add_to_brands(brand):
    """Add a new brand to the list if not already present"""
    if brand and brand.lower() not in [br.lower() for br in BRANDS]:
        BRANDS.append(brand.lower())
        print(f"✅ Added brand: {brand}")

def add_to_genders(gender):
    """Add a new gender to the list if not already present"""
    if gender and gender.lower() not in [gen.lower() for gen in GENDERS]:
        GENDERS.append(gender.lower())
        print(f"✅ Added gender: {gender}")

def update_lists_from_product(product):
    """Update all lists based on a product's attributes"""
    if product.get("category"):
        add_to_categories(product["category"])
    if product.get("color"):
        add_to_colors(product["color"])
    if product.get("brand"):
        add_to_brands(product["brand"])
    if product.get("gender"):
        add_to_genders(product["gender"])

def lemmatize_list(word_list):
    """Enhanced lemmatization that handles singular/plural forms better"""
    lemmatized = []
    for word in word_list:
        # Add the original word
        lemmatized.append(word.lower())
        
        # Add lemmatized version
        doc = nlp(word.lower())
        if doc:
            lemma = doc[0].lemma_.lower()
            if lemma != word.lower():
                lemmatized.append(lemma)
        
        # Add common variations (singular/plural)
        if word.lower().endswith('s'):
            # If plural, add singular
            singular = word.lower()[:-1]
            lemmatized.append(singular)
        else:
            # If singular, add plural
            plural = word.lower() + 's'
            lemmatized.append(plural)
    
    return list(set(lemmatized))

CATEGORIES = lemmatize_list(RAW_CATEGORIES)

PRICE_PATTERNS = [
    (r"between (\d+) and (\d+)", "between"),
    (r"(?:under|below|less than)\s*\$?(\d+)", "<"),
    (r"(?:above|over|greater than)\s*\$?(\d+)", ">"),
    (r"(?:upto|up to)\s*\$?(\d+)", "<="),
]

def fuzzy_match(token, choices, threshold=55):  # Lowered threshold for better misspelling tolerance
    match, score, _ = process.extractOne(token, choices, scorer=fuzz.ratio)
    return match if score >= threshold else None

def fuzzy_match_brand(token, choices, threshold=55):  # Lowered threshold for better brand matching
    """Enhanced fuzzy matching specifically for brands with multiple scoring methods"""
    # Try exact match first
    if token.lower() in [choice.lower() for choice in choices]:
        return token.lower()
    
    # Try fuzzy matching with different scorers
    results = []
    
    # Try ratio scoring
    ratio_result = process.extractOne(token, choices, scorer=fuzz.ratio)
    if ratio_result[1] >= threshold:
        results.append((ratio_result[0], ratio_result[1], 'ratio'))
    
    # Try partial ratio for partial matches (like "iphon" matching "iphone")
    # Lower threshold for partial matching
    partial_result = process.extractOne(token, choices, scorer=fuzz.partial_ratio)
    if partial_result[1] >= 45:  # Lower threshold for partial matches
        results.append((partial_result[0], partial_result[1], 'partial'))
    
    # Try token sort ratio for word order variations
    token_sort_result = process.extractOne(token, choices, scorer=fuzz.token_sort_ratio)
    if token_sort_result[1] >= threshold:
        results.append((token_sort_result[0], token_sort_result[1], 'token_sort'))
    
    # Try token set ratio for better partial matching
    token_set_result = process.extractOne(token, choices, scorer=fuzz.token_set_ratio)
    if token_set_result[1] >= 45:  # Lower threshold for token set
        results.append((token_set_result[0], token_set_result[1], 'token_set'))
    
    # Return the best match
    if results:
        best_match = max(results, key=lambda x: x[1])
        return best_match[0]
    
    return None

def fuzzy_match_category(token, choices, threshold=50):  # Even lower threshold for categories
    """Enhanced fuzzy matching for categories with multiple scoring methods"""
    # Try exact match first
    if token.lower() in [choice.lower() for choice in choices]:
        return token.lower()
    
    # Try fuzzy matching with different scorers
    results = []
    
    # Try ratio scoring
    ratio_result = process.extractOne(token, choices, scorer=fuzz.ratio)
    if ratio_result[1] >= threshold:
        results.append((ratio_result[0], ratio_result[1], 'ratio'))
    
    # Try partial ratio for partial matches
    partial_result = process.extractOne(token, choices, scorer=fuzz.partial_ratio)
    if partial_result[1] >= 40:  # Lower threshold for partial matches
        results.append((partial_result[0], partial_result[1], 'partial'))
    
    # Try token sort ratio for word order variations
    token_sort_result = process.extractOne(token, choices, scorer=fuzz.token_sort_ratio)
    if token_sort_result[1] >= threshold:
        results.append((token_sort_result[0], token_sort_result[1], 'token_sort'))
    
    # Try token set ratio for better partial matching
    token_set_result = process.extractOne(token, choices, scorer=fuzz.token_set_ratio)
    if token_set_result[1] >= 40:  # Lower threshold for token set
        results.append((token_set_result[0], token_set_result[1], 'token_set'))
    
    # Return the best match
    if results:
        best_match = max(results, key=lambda x: x[1])
        return best_match[0]
    
    return None

def normalize_token(token):
    token = token.lower()
    for field in ["categories", "brands", "colors", "genders"]:
        if field in SYNONYM_MAP:
            for key, synonyms in SYNONYM_MAP[field].items():
                if token in synonyms:
                    return key
    return token

def apply_multiword_synonyms(query):
    for pattern, replacement in MULTIWORD_SYNONYM_PATTERNS:
        query = re.sub(pattern, replacement, query, flags=re.IGNORECASE)
    return query

def parse_query(query):
    query = query.lower()
    query = apply_multiword_synonyms(query)
    doc = nlp(query)

    result = {
        "keywords": [],
        "category": None,
        "brand": None,
        "color": None,
        "gender": None,
        "price_min": None,
        "price_max": None
    }

    for pattern, op in PRICE_PATTERNS:
        m = re.search(pattern, query)
        if m:
            if op == "between":
                result["price_min"] = int(m.group(1))
                result["price_max"] = int(m.group(2))
            else:
                val = int(m.group(1))
                if op in ("<", "<="):
                    result["price_max"] = val
                elif op in (">", ">="):
                    result["price_min"] = val
            break

    seen_keywords = set()

    for token in doc:
        raw_text = token.text.lower()
        lemma_text = token.lemma_.lower()

        norm_token = normalize_token(raw_text)
        norm_lemma = normalize_token(lemma_text)

        # 👇 Brand: Check first (higher priority for brand matching)
        if result["brand"] is None:
            if norm_token in BRANDS:
                result["brand"] = norm_token
                continue
            br = fuzzy_match_brand(norm_token, BRANDS)
            if br:
                result["brand"] = br
                continue

        # 👇 Category: normalize + lemmatize (lower priority)
        if result["category"] is None:
            cat_token = nlp(norm_token)[0].lemma_
            cat_lemma = nlp(norm_lemma)[0].lemma_
            
            # First try exact match on the raw token
            if norm_token in CATEGORIES:
                result["category"] = norm_token
                continue
                
            # Try exact match on lemmatized token
            if cat_token in CATEGORIES:
                result["category"] = cat_token
                continue
                
            # Try exact match on lemmatized lemma
            if cat_lemma in CATEGORIES:
                result["category"] = cat_lemma
                continue
            
            # Try fuzzy matching for categories with lower threshold
            cat = fuzzy_match_category(cat_lemma, CATEGORIES)
            if cat:
                result["category"] = cat
                continue
                
            # Also try fuzzy matching on the raw token
            cat = fuzzy_match_category(norm_token, CATEGORIES)
            if cat:
                result["category"] = cat
                continue
                
            # Try fuzzy matching on the lemmatized token
            cat = fuzzy_match_category(cat_token, CATEGORIES)
            if cat:
                result["category"] = cat
                continue

        # Color
        if result["color"] is None:
            if norm_token in COLORS:
                result["color"] = norm_token
                continue
            col = fuzzy_match(norm_token, COLORS)
            if col:
                result["color"] = col
                continue

        # Gender
        if result["gender"] is None:
            if norm_token in GENDERS:
                result["gender"] = norm_token
                continue
            gen = fuzzy_match(norm_token, GENDERS)
            if gen:
                result["gender"] = gen
                continue

        if not token.is_stop and not token.is_punct and not token.like_num:
            seen_keywords.add(token.text)

    result["keywords"] = list(seen_keywords)
    return result

# Optional: test
if __name__ == "__main__":
    print("🔍 Debug: Available Categories")
    print("RAW_CATEGORIES:", RAW_CATEGORIES)
    print("LEMMATIZED CATEGORIES:", CATEGORIES)
    print("-" * 50)
    
    sample_queries = [
        "black puma sneakers for men under 3000",
        "snikers for men",  # Test misspelling
        "lnovo laptop",     # Test misspelling
        "nike snikers",     # Test misspelling
        "sneaker for men",  # Test singular form
        "shoe for women",   # Test singular form
        "laptop under 50000" # Test laptop category
    ]

    for q in sample_queries:
        print(f"\n🔍 Query: {q}")
        result = parse_query(q)
        print(f"   Category: {result.get('category', 'None')}")
        print(f"   Brand: {result.get('brand', 'None')}")
        print(f"   Color: {result.get('color', 'None')}")
        print(f"   Gender: {result.get('gender', 'None')}")
        print(f"   Price Range: {result.get('price_min', 'None')} - {result.get('price_max', 'None')}")
        print(f"   Keywords: {', '.join(result.get('keywords', []))}")
        print("-" * 40)