import hashlib
from flask import request, jsonify
from sqlalchemy import func
from backend.app import db
from backend.models import AnalysisHistory, Subscriber
from backend.api import analytics_bp
from flask_cors import cross_origin
from backend.services.text_analyzer import analyze_text
from backend.services.keyword_service import analyze_keywords
from backend.api.auth import token_required, optional_auth

@analytics_bp.route('/subscribe', methods=['POST', 'OPTIONS'])
@cross_origin()
def subscribe():
    """Endpoint for the premium keyword analysis gate."""
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    data = request.get_json()
    email = data.get('email', '').strip()
    
    if not email or '@' not in email:
        return jsonify({'error': 'Invalid email address provided.'}), 400
        
    try:
        # Check if they already exist so we don't throw an ugly duplicate key error
        existing = Subscriber.query.filter_by(email=email).first()
        if not existing:
            new_subscriber = Subscriber(email=email)
            db.session.add(new_subscriber)
            db.session.commit()
            
        return jsonify({
            'success': True, 
            'message': 'Successfully subscribed!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"DATABASE ERROR during subscription: {str(e)}")
        return jsonify({'error': f"A database error occurred: {str(e)}"}), 500

@analytics_bp.route('/analyze', methods=['POST', 'OPTIONS'])
@cross_origin()
@optional_auth
def analyze(current_user):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    analysis_results = analyze_text(text)
    keyword_results = analyze_keywords(text)
    
    # Check if we should save this text logic based on hashing
    history_id = None
    if current_user:
        doc_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
        
        # Save to history
        new_history = AnalysisHistory(
            user_id=current_user.id,
            document_hash=doc_hash,
            content_snippet=text[:500],  # Get first 500 characters
            word_count=analysis_results['word_count'],
            reading_time=analysis_results['reading_time_mins']
        )
        db.session.add(new_history)
        db.session.commit()
        history_id = new_history.id
    
    return jsonify({
        'results': analysis_results,
        'history_id': history_id,
        'keywords': keyword_results['keywords'],
        'seo_keywords': keyword_results['seo_keywords'],
        'geo_keywords': keyword_results['geo_keywords'],
        'aeo_keywords': keyword_results['aeo_keywords'],
        'google_suggestions': keyword_results['google_suggestions']
    }), 200

@analytics_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Fetch paginated logs securely for the authenticated user
    pagination = AnalysisHistory.query.filter_by(user_id=current_user.id)\
        .order_by(AnalysisHistory.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
        
    items = []
    for item in pagination.items:
        items.append({
            'id': item.id,
            'content_snippet': item.content_snippet,
            'word_count': item.word_count,
            'reading_time': item.reading_time,
            'created_at': item.created_at.isoformat()
        })
        
    return jsonify({
        'history': items,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev,
        'total_pages': pagination.pages,
        'current_page': page,
        'total_items': pagination.total
    }), 200

@analytics_bp.route('/stats/summary', methods=['GET'])
@token_required
def get_stats_summary(current_user):
    # Offload heavy aggregation to PostgreSQL database side.
    total_words = db.session.query(func.sum(AnalysisHistory.word_count)).filter_by(user_id=current_user.id).scalar() or 0
    total_documents = db.session.query(func.count(AnalysisHistory.id)).filter_by(user_id=current_user.id).scalar() or 0
    
    return jsonify({
        'total_words': total_words,
        'total_documents': total_documents
    }), 200
