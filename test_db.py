import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.app import app, db
from backend.models import Subscriber
with app.app_context():
    try:
        db.create_all()
        print("db.create_all() passed")
        res = Subscriber.query.all()
        print(f"Subscribers: {res}")
    except Exception as e:
        print(f"Error: {e}")
