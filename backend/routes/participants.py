#participants.py
from flask import Blueprint, request, jsonify
from models import db, Participant, Event
import random
import qrcode
import base64
from io import BytesIO


participants_bp = Blueprint('participants', __name__)

def generate_code():
    return str(random.randint(100000, 999999))

@participants_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    event_code = data.get('event_code')
    event = Event.query.filter_by(event_code=event_code).first()
    if not event:
        return jsonify({'status': 'error', 'message': 'Invalid event code'}), 400

    # Генерация уникального шестизначного кода
    code = generate_code()

    participant = Participant(
        last_name=data.get('last_name'),
        first_name=data.get('first_name'),
        middle_name=data.get('middle_name'),
        group=data.get('group'),
        vk_link=data.get('vk_link'),
        additional=data.get('additional'),
        unique_code=code,
        event=event
    )

    db.session.add(participant)
    db.session.commit()

    # Генерация QR-кода
    qr = qrcode.make(code)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)
    qr_base64 = base64.b64encode(buffer.read()).decode('utf-8')

    return jsonify({
        'status': 'ok',
        'code': code,
        'qr': f'data:image/png;base64,{qr_base64}'
    })

@participants_bp.route('/scan', methods=['POST'])
def scan_participant():
    data = request.json
    event_code = data.get('event_code')
    unique_code = data.get('unique_code')

    event = Event.query.filter_by(event_code=event_code).first()
    if not event:
        return jsonify({'status': 'error', 'message': 'Мероприятие не найдено'}), 404

    participant = Participant.query.filter_by(unique_code=unique_code, event_id=event.id).first()
    if not participant:
        return jsonify({'status': 'error', 'message': 'Код не найден в этом мероприятии'}), 404

    if participant.visited:
        return jsonify({'status': 'ok', 'message': 'Уже отмечен ранее'})

    participant.visited = True
    db.session.commit()

    return jsonify({'status': 'ok', 'message': 'Участник отмечен'})
