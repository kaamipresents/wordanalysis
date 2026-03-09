import hashlib
from flask import request, jsonify
from sqlalchemy import func
from backend.app import db
from backend.models import AnalysisHistory
from backend.api import analytics_bp
from backend.api.auth import token_required, optional_auth
from backend.services.text_analyzer import analyze_text

@analytics_bp.route('/analyze', methods=['POST'])
@optional_auth
def analyze(current_user):
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    analysis_results = analyze_text(text)
    
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
        'history_id': history_id
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
