#models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    event_date = db.Column(db.String(50))
    location = db.Column(db.String(255))
    description = db.Column(db.String(500))
    additional_info = db.Column(db.String(255))
    event_code = db.Column(db.String(20), unique=True)
    participants = db.relationship('Participant', backref='event', lazy=True)

class Participant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    last_name = db.Column(db.String(100))
    first_name = db.Column(db.String(100))
    middle_name = db.Column(db.String(100), nullable=True)
    group = db.Column(db.String(50))
    vk_link = db.Column(db.String(255))
    additional = db.Column(db.String(255))
    unique_code = db.Column(db.String(20), unique=True)
    visited = db.Column(db.Boolean, default=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=True)
