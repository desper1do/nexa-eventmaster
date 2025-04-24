#events.py
from flask import Blueprint, request, jsonify
from models import db, Event
import random

events_bp = Blueprint('events', __name__)

def generate_event_code():
    return str(random.randint(100000, 999999))

@events_bp.route('/events/create', methods=['POST'])
def create_event():
    data = request.json
    name = data.get('name')
    event_date = data.get('event_date')
    description = data.get('description')
    additional_info = data.get('additional_info')
    location = data.get('location')

    code = generate_event_code()

    event = Event(
        name=name,
        event_date=event_date,
        description=description,
        additional_info=additional_info,
        location=location, 
        event_code=code
    )
    db.session.add(event)
    db.session.commit()

    return jsonify({'status': 'ok', 'event_code': code, 'event_id': event.id})

@events_bp.route('/events/<event_code>', methods=['GET'])
def get_event_by_code(event_code):
    event = Event.query.filter_by(event_code=event_code).first()
    if not event:
        return jsonify({'status': 'error', 'message': 'Мероприятие не найдено'}), 404

    return jsonify({
        'status': 'ok',
        'name': event.name,
        'description': event.description,
        'event_date': event.event_date,
        'additional_info': event.additional_info,
        'location': event.location 
    })