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
        'location': event.location,
        'published': event.published 
    })


@events_bp.route('/events/<event_code>/publish', methods=['POST'])
def toggle_publish(event_code):
    event = Event.query.filter_by(event_code=event_code).first()
    if not event:
        return jsonify({'status': 'error', 'message': 'Мероприятие не найдено'}), 404

    data = request.json
    publish = data.get('publish')

    if publish is None:
        return jsonify({'status': 'error', 'message': 'Не передан параметр publish'}), 400

    event.published = publish
    db.session.commit()

    return jsonify({'status': 'ok', 'published': event.published})


@events_bp.route('/events/published', methods=['GET'])
def get_published_events():
    events = Event.query.filter_by(published=True).all()
    result = sorted(events, key=lambda e: e.event_date)

    return jsonify([{
        'name': e.name,
        'event_date': e.event_date,
        'location': e.location,
        'description': e.description,
        'event_code': e.event_code
    } for e in result])

@events_bp.route('/events/all', methods=['GET'])
def get_all_events():
    events = Event.query.all()
    result = sorted(events, key=lambda e: e.event_date)

    return jsonify([{
        'name': e.name,
        'event_date': e.event_date,
        'location': e.location,
        'description': e.description,
        'event_code': e.event_code,
        'published': e.published
    } for e in result])


@events_bp.route('/events/<event_code>', methods=['DELETE'])
def delete_event(event_code):
    event = Event.query.filter_by(event_code=event_code).first()
    if not event:
        return jsonify({'status': 'error', 'message': 'Мероприятие не найдено'}), 404

    for p in event.participants:
        db.session.delete(p)

    db.session.delete(event)
    db.session.commit()
    return jsonify({'status': 'ok', 'message': 'Мероприятие удалено'})
