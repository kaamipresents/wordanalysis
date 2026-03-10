from backend.app import create_app
from backend.services.keyword_service import analyze_keywords

app = create_app()

with app.app_context():
    text = "LED bulbs save electricity for home lighting"
    results = analyze_keywords(text)
    print("KEYWORDS:", results['keywords'])
    print("SEO:", results['seo_keywords'])
    print("GEO:", results['geo_keywords'])
    print("AEO:", results['aeo_keywords'])
    print("SUGGESTIONS:", results['google_suggestions'])
