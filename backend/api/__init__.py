from flask import Blueprint

auth_bp = Blueprint('auth', __name__)
analytics_bp = Blueprint('analytics', __name__)

from . import auth, analytics
