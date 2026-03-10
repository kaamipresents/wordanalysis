import uuid
from datetime import datetime
from backend.app import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Relationships
    history = db.relationship('AnalysisHistory', backref='user', lazy=True, cascade="all, delete-orphan")
    settings = db.relationship('UserSetting', uselist=False, backref='user', cascade="all, delete-orphan")

class AnalysisHistory(db.Model):
    __tablename__ = 'analysis_history'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    document_hash = db.Column(db.String(64), index=True)
    content_snippet = db.Column(db.Text)
    word_count = db.Column(db.Integer)
    reading_time = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class UserSetting(db.Model):
    __tablename__ = 'user_settings'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    theme_preference = db.Column(db.String(50), default='dark')
    default_language = db.Column(db.String(10), default='en')

class Subscriber(db.Model):
    __tablename__ = 'subscribers'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
