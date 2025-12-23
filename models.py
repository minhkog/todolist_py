from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    # Priority: 1 (High/Urgent), 2 (Medium), 3 (Low)
    priority = db.Column(db.Integer, default=2) 
    # Status: 'pending', 'completed'
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'priority': self.priority,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
