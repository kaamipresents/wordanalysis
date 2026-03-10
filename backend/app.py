import sys
import os

# Add parent directory to python path so 'backend' module is found when running 'python app.py'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    # Configure SQLAlchemy to use connection pooling
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
    
    db.init_app(app)

    with app.app_context():
        from backend.api.auth import auth_bp
        from backend.api.analytics import analytics_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
        db.create_all()

    @app.route('/health')
    def health_check():
        return jsonify({"status": "ok", "message": "Backend is running!"})

    return app

# Create the Flask application instance (needed for Vercel)
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
