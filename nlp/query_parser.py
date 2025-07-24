import spacy
import re
from rapidfuzz import process, fuzz

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

def fuzzy_match(token, choices, threshold=70):
    match, score, _ = process.extractOne(token, choices, scorer=fuzz.ratio)
    return match if score >= threshold else None

# Original word lists
RAW_CATEGORIES = ["sneakers", "shoes", "sandals", "boots", "heels", "flats", "slippers", "phone", "phones", "mobile", "smartphone","earphone"]
COLORS = ["red", "blue", "black", "white", "green", "yellow", "pink", "brown", "grey", "orange", "purple"]
GENDERS = ["men", "women", "boys", "girls", "unisex"]

# Lemmatize category list for consistency
def lemmatize_list(word_list):
    return list(set([token.lemma_ for token in nlp(" ".join(word_list))]))

CATEGORIES = lemmatize_list(RAW_CATEGORIES)

# Add known brands list
BRANDS = ["nike", "adidas", "puma", "reebok", "skechers", "new balance", "asics", "fila", "converse", "vans", "woodland", "red tape", "bata", "h&m", "zara", "campus", "sparx", "crocs", "iphone", "samsung", "apple", "xiaomi", "oneplus", "oppo", "vivo"]

# Synonym map (single-word)
SYNONYM_MAP = {
    "airpod": "earphones",
    "headphone": "earphones",
    "earphone": "earphones",

    "kicks": "shoes",
    "sneaker": "shoes",

    "mobile": "phone",
    "smartphone": "phone",
    "cellphone": "phone"
}

# Multiword synonym replacements: (regex_pattern, replacement)
MULTIWORD_SYNONYM_PATTERNS = [
    (r"running shoes", "shoes"),
    (r"basketball shoes", "shoes"),
    (r"tennis shoes", "shoes"),
    (r"mobile phone", "phone"),
    (r"cell phone", "phone"),
    (r"flip flops", "slippers"),
    (r"canvas shoes", "shoes"),
]

# Price regex patterns
PRICE_PATTERNS = [
    (r"below (\d+)", "<"),
    (r"under (\d+)", "<"),
    (r"less than (\d+)", "<"),
    (r"above (\d+)", ">"),
    (r"over (\d+)", ">"),
    (r"greater than (\d+)", ">"),
    (r"upto (\d+)", "<="),
    (r"up to (\d+)", "<="),
    (r"between (\d+) and (\d+)", "between"),
]

def normalize_token(token):
    return SYNONYM_MAP.get(token.lower(), token.lower())

def apply_multiword_synonyms(query):
    for pattern, replacement in MULTIWORD_SYNONYM_PATTERNS:
        query = re.sub(pattern, replacement, query, flags=re.IGNORECASE)
    return query

def parse_query(query):
    query = apply_multiword_synonyms(query.lower())
    doc = nlp(query)

    result = {
        "category": None,
        "color": [],
        "price_filter": None,
        "gender": None,
        "brand": None
    }

    # Category with fuzzy matching
    for token in doc:
        normalized = normalize_token(token.lemma_)
        matched_category = fuzzy_match(normalized, CATEGORIES)
        if matched_category:
            result["category"] = matched_category
            break

    # Color with fuzzy matching
    found_colors = set()
    for token in doc:
        normalized = normalize_token(token.text)
        matched_color = fuzzy_match(normalized, COLORS)
        if matched_color:
            found_colors.add(matched_color)
    if found_colors:
        result["color"] = list(found_colors)

    # Gender with fuzzy matching
    for token in doc:
        normalized = normalize_token(token.text)
        matched_gender = fuzzy_match(normalized, GENDERS)
        if matched_gender:
            result["gender"] = matched_gender
            break

    # Price
    for pattern, op in PRICE_PATTERNS:
        m = re.search(pattern, query)
        if m:
            if op == "between":
                result["price_filter"] = {
                    "operator": op,
                    "min": int(m.group(1)),
                    "max": int(m.group(2))
                }
            else:
                result["price_filter"] = {
                    "operator": op,
                    "value": int(m.group(1))
                }
            break

    # Brand Detection with fuzzy matching
    brand_candidates = set()

    # Fuzzy match brands
    for token in doc:
        normalized = normalize_token(token.text)
        matched_brand = fuzzy_match(normalized, BRANDS)
        # print(f"Normalized: {normalized}")
        # print(f"Matched brand: {matched_brand}")
        if matched_brand:
            brand_candidates.add(matched_brand)

    # NER detection
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT"]:
            ent_text = ent.text.lower()
            if not any(fuzzy_match(ent_text, [brand]) for brand in brand_candidates):
                brand_candidates.add(ent_text)

    # Substring match for multi-word brands
    for brand in BRANDS:
        if brand in query:
            brand_candidates.add(brand)

    if brand_candidates:
        result["brand"] = list(brand_candidates)

    return result

if __name__ == "__main__":
    # Example usage
    queries = [
        "red Niki sneakers below 1500 for women",
        "blue shoes above 2000 for men",
        "black boots between 1000 and 3000 for girls",
        "white sandals under 1200 for boys",
        "pink slippers up to 900",
        "green heels less than 2000",
        "orange flats over 1300 for unisex",
        "iphon under 2000",
        "I want AirPods under 2000 for girls",
        "canvas shoes below 1000 for men",
        "flip flops under 500"
    ]

    for q in queries:
        print(f"Query: {q}")
        print(parse_query(q))
        print()
