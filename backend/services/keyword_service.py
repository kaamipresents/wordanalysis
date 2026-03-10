import re
import time
import requests

# Simple in-memory cache
# Format: { "input_text": {"data": {}, "expires_at": timestamp} }
keyword_cache = {}
CACHE_DURATION = 24 * 60 * 60  # 24 hours in seconds

STOPWORDS = set([
    "a", "the", "and", "for", "of", "to", "in", "is", "it", "that", "this", 
    "with", "as", "by", "on", "are", "be", "at", "or", "from", "an", "was",
    "we", "will", "can", "has", "have", "not", "but", "they", "you", "your"
])

def clean_text(text):
    """Lowercase, remove punctuation, tokenize, and remove stopwords."""
    text = text.lower()
    # Remove punctuation
    text = re.sub(r'[^\w\s]', '', text)
    tokens = text.split()
    # Remove stopwords
    cleaned_tokens = [word for word in tokens if word not in STOPWORDS]
    return cleaned_tokens

def generate_ngrams(tokens, n):
    """Generate n-grams from a list of tokens."""
    return [' '.join(tokens[i:i+n]) for i in range(len(tokens)-n+1)]

def extract_keywords(text):
    """Extract individual keywords, 2-word, and 3-word phrases."""
    tokens = clean_text(text)
    
    keywords = list(tokens) # 1-word
    keywords.extend(generate_ngrams(tokens, 2)) # 2-word
    keywords.extend(generate_ngrams(tokens, 3)) # 3-word
    
    # Remove duplicates but preserve order roughly
    seen = set()
    unique_keywords = []
    for kw in keywords:
        if kw not in seen:
            seen.add(kw)
            unique_keywords.append(kw)
            
    return unique_keywords

def get_google_suggestions(keyword):
    """Fetch autocomplete suggestions from Google."""
    try:
        url = f"https://suggestqueries.google.com/complete/search?client=firefox&q={keyword}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if len(data) > 1 and isinstance(data[1], list):
                return data[1][:5]  # Limit to top 5 suggestions per keyword
    except Exception as e:
        print(f"Error fetching Google suggestions for {keyword}: {e}")
    return []

def generate_seo_keywords(keyword):
    patterns = [
        f"best {keyword}",
        f"cheap {keyword}",
        f"{keyword} price",
        f"{keyword} for home",
        f"energy saving {keyword}",
        f"top {keyword}",
        f"{keyword} benefits"
    ]
    return patterns

def generate_geo_keywords(keyword):
    patterns = [
        f"what is the best {keyword}",
        f"which {keyword} is best",
        f"{keyword} for home use",
        f"best way to use {keyword}"
    ]
    return patterns

def generate_aeo_keywords(keyword):
    patterns = [
        f"what is {keyword}",
        f"how does {keyword} work",
        f"why is {keyword} useful",
        f"when should you use {keyword}"
    ]
    return patterns

def analyze_keywords(text):
    """Main function to orchestrate keyword analysis processing with caching."""
    if not text or not text.strip():
        return {
            "keywords": [],
            "seo_keywords": [],
            "geo_keywords": [],
            "aeo_keywords": [],
            "google_suggestions": []
        }
        
    normalized_input = text.strip().lower()
    current_time = time.time()
    
    # Check cache
    if normalized_input in keyword_cache:
        cached_entry = keyword_cache[normalized_input]
        if current_time < cached_entry["expires_at"]:
            return cached_entry["data"]
        else:
            del keyword_cache[normalized_input] # Expire old cache
            
    # Process
    extracted_keywords = extract_keywords(normalized_input)
    
    # We don't want to explode with too many combinations, so let's limit 
    # the base keywords for expansion to the top 5 longest/most meaningful ones
    # or just use 2-word and 3-word n-grams mainly. 
    # For the assignment, we will use the top extracted keywords.
    # To match the example, we should use phrases like "led bulbs".
    
    # Focus on 2-word and 3-word phrases if available, otherwise fallback to 1-word
    focus_keywords = [kw for kw in extracted_keywords if ' ' in kw][:3]
    if not focus_keywords:
        focus_keywords = extracted_keywords[:3]
        
    if not focus_keywords and extracted_keywords:
        focus_keywords = [extracted_keywords[0]]
        
    seo_keywords = []
    geo_keywords = []
    aeo_keywords = []
    google_suggestions = []
    
    for kw in focus_keywords:
        seo_keywords.extend(generate_seo_keywords(kw))
        geo_keywords.extend(generate_geo_keywords(kw))
        aeo_keywords.extend(generate_aeo_keywords(kw))
        
        suggestions = get_google_suggestions(kw)
        google_suggestions.extend(suggestions)
        
    # Deduplicate results
    results = {
        "keywords": extracted_keywords[:10], # Limit to top 10 to keep it manageable
        "seo_keywords": list(dict.fromkeys(seo_keywords)),
        "geo_keywords": list(dict.fromkeys(geo_keywords)),
        "aeo_keywords": list(dict.fromkeys(aeo_keywords)),
        "google_suggestions": list(dict.fromkeys(google_suggestions))
    }
    
    # Save to cache
    keyword_cache[normalized_input] = {
        "data": results,
        "expires_at": current_time + CACHE_DURATION
    }
    
    return results
