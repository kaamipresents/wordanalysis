import sys
import os

# Add parent directory to python path so 'backend' module is found when running 'python app.py'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from backend.extensions import db

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    db_url = os.environ.get('DATABASE_URL')
    
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is missing!")
        
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
        
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-secret-fallback')
    
    # For Serverless environments (Vercel) using a Transaction Pooler (Supabase),
    # it is highly recommended to disable SQLAlchemy's internal connection pool
    # to prevent idle connection timeouts and pool exhaustion.
    from sqlalchemy.pool import NullPool
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'poolclass': NullPool
    }
    
    db.init_app(app)

    with app.app_context():
        from backend.api import auth_bp, analytics_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
        try:
            db.create_all()
        except Exception as e:
            print(f"Warning: Failed to create database tables (likely due to Supabase pooler restrictions): {e}")

    @app.route('/health')
    def health_check():
        return jsonify({"status": "ok", "message": "Backend is running!"})

    # Global Exception Handler to catch all unhandled Python errors on Vercel
    # and return them as JSON instead of Vercel's generic 500 HTML page.
    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        return jsonify({
            "error": "A backend Python exception occurred.",
            "message": str(e),
            "traceback": traceback.format_exc()
        }), 500

    # Catch-all route to debug path routing issues on Vercel
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>', methods=['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'])
    def catch_all(path):
        return jsonify({
            "error": "Not Found",
            "message": "The requested API route was not matched by Flask.",
            "path_seen_by_flask": path,
            "full_path": request.full_path,
            "script_root": request.script_root,
            "base_url": request.base_url
        }), 404

    return app

# Create the Flask application instance (needed for Vercel)
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
