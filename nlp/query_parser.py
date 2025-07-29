import spacy
import re
import json
from rapidfuzz import process, fuzz

nlp = spacy.load("en_core_web_sm")

# Load synonyms from JSON
with open("synonym.json", "r") as f:
    synonym_data = json.load(f)

SYNONYM_MAP = synonym_data  # expects 'categories', 'brands', etc.

MULTIWORD_SYNONYM_PATTERNS = [
    (r"smart phones?", "smartphone"),
    (r"running shoes?", "sports shoes")
]

# Global lists that can be updated
RAW_CATEGORIES = ["shoes", "sandals", "boots", "heels", "flats", "slippers", "phone", "phones", "mobile", "smartphone", "earphone"]
COLORS = ["red", "blue", "black", "white", "green", "yellow", "pink", "brown", "grey", "orange", "purple"]
GENDERS = ["men", "women", "boys", "girls", "unisex"]
BRANDS = ["nike", "adidas", "puma", "reebok", "skechers", "new balance", "asics", "fila", "converse", "vans", "woodland", "red tape", "bata", "h&m", "zara", "campus", "sparx", "crocs", "iphone", "samsung", "apple", "xiaomi", "oneplus", "oppo", "vivo"]

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
    return list(set([token.lemma_ for token in nlp(" ".join(word_list))]))

CATEGORIES = lemmatize_list(RAW_CATEGORIES)

PRICE_PATTERNS = [
    (r"between (\d+) and (\d+)", "between"),
    (r"(?:under|below|less than)\s*\$?(\d+)", "<"),
    (r"(?:above|over|greater than)\s*\$?(\d+)", ">"),
    (r"(?:upto|up to)\s*\$?(\d+)", "<="),
]

def fuzzy_match(token, choices, threshold=75):
    match, score, _ = process.extractOne(token, choices, scorer=fuzz.ratio)
    return match if score >= threshold else None

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

        # 👇 Category: normalize + lemmatize
        if result["category"] is None:
            cat_token = nlp(norm_token)[0].lemma_
            cat_lemma = nlp(norm_lemma)[0].lemma_
            if cat_token in CATEGORIES:
                result["category"] = cat_token
                continue
            if cat_lemma in CATEGORIES:
                result["category"] = cat_lemma
                continue
            cat = fuzzy_match(cat_lemma, CATEGORIES)
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

        # Brand
        if result["brand"] is None:
            if norm_token in BRANDS:
                result["brand"] = norm_token
                continue
            br = fuzzy_match(norm_token, BRANDS)
            if br:
                result["brand"] = br
                continue

        if not token.is_stop and not token.is_punct and not token.like_num:
            seen_keywords.add(token.text)

    result["keywords"] = list(seen_keywords)
    return result

# Optional: test
if __name__ == "__main__":
    sample_queries = [
        "black puma sneakers for men under 3000"
    ]

    for q in sample_queries:
        print(f"Query: {q}")
        print(parse_query(q))
        print("-" * 40)