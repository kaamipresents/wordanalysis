import re
from collections import Counter

STOP_WORDS = set([
    "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", 
    "with", "in", "into", "of", "off", "out", "over", "under", "up", "down", "is", "are", 
    "am", "was", "were", "be", "been", "being", "it", "its", "they", "their", "them", 
    "this", "that", "these", "those", "i", "you", "he", "she", "we", "my", "your", "his", 
    "her", "our", "as", "if", "then", "else", "when", "where", "why", "how", "all", "any", 
    "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", 
    "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now"
])

def analyze_text(text: str) -> dict:
    if not text or not text.strip():
        return {
            "word_count": 0,
            "char_count_spaces": 0,
            "char_count_no_spaces": 0,
            "sentence_count": 0,
            "paragraph_count": 0,
            "reading_time_mins": 0,
            "speaking_time_mins": 0,
            "keyword_density": []
        }

    # Word Count: Filter out punctuation/empty strings
    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)

    # Character Counts
    char_count_spaces = len(text)
    char_count_no_spaces = len(re.sub(r'\s+', '', text))

    # Sentence Count (Split by punctuation marks followed by space or EOF)
    sentences = re.split(r'[.!?]+(?=\s|$)', text)
    sentence_count = len([s for s in sentences if s.strip()])

    # Paragraph Count (Split by multiple newlines)
    paragraphs = re.split(r'\n\s*\n', text.strip())
    paragraph_count = len([p for p in paragraphs if p.strip()])

    # Estimated Times (wpm)
    reading_time_mins = round(word_count / 225, 2)
    speaking_time_mins = round(word_count / 150, 2)

    # Keyword Density
    lower_words = [w.lower() for w in words]
    filtered_words = [w for w in lower_words if w not in STOP_WORDS]
    
    total_filtered = len(filtered_words)
    keyword_freq = Counter(filtered_words)
    
    keyword_density = []
    if total_filtered > 0:
        for word, count in keyword_freq.most_common(10):
            density = round((count / total_filtered) * 100, 2)
            keyword_density.append({
                "word": word,
                "count": count,
                "density": density
            })

    return {
        "word_count": word_count,
        "char_count_spaces": char_count_spaces,
        "char_count_no_spaces": char_count_no_spaces,
        "sentence_count": sentence_count,
        "paragraph_count": paragraph_count,
        "reading_time_mins": reading_time_mins,
        "speaking_time_mins": speaking_time_mins,
        "keyword_density": keyword_density
    }
