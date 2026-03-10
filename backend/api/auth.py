from flask import request, jsonify, current_app
from backend.extensions import db
from backend.models import User, UserSetting
from backend.api import auth_bp
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt
from datetime import datetime, timedelta
from functools import wraps

ph = PasswordHasher()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def optional_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
                try:
                    data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
                    current_user = User.query.filter_by(id=data['user_id']).first()
                except:
                    pass

        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 409

    hashed_pw = ph.hash(password)
    new_user = User(email=email, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    # Create default settings
    default_setting = UserSetting(user_id=new_user.id)
    db.session.add(default_setting)
    db.session.commit()

    return jsonify({'message': 'User created successfully', 'user_id': new_user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Could not verify', 'error': 'Missing data'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'message': 'Could not verify', 'error': 'User not found'}), 401

    try:
        if ph.verify(user.password_hash, password):
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, current_app.config['SECRET_KEY'], algorithm="HS256")
            
            return jsonify({'token': token, 'user_id': user.id, 'email': user.email}), 200
    except VerifyMismatchError:
        pass
        
    return jsonify({'message': 'Could not verify', 'error': 'Wrong password'}), 401
