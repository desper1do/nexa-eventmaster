#export.py
from flask import Blueprint, send_file, jsonify
from models import db, Event, Participant
import openpyxl
from io import BytesIO

export_bp = Blueprint('export', __name__)

@export_bp.route('/export/<event_code>', methods=['GET'])
def export_participants(event_code):
    event = Event.query.filter_by(event_code=event_code).first()
    if not event:
        return jsonify({'status': 'error', 'message': 'Мероприятие не найдено'}), 404

    participants = Participant.query.filter_by(event_id=event.id).all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Участники"

    ws.append(["№", "Фамилия", "Имя", "Отчество", "Группа", "ВК", "Уникальный код", "Статус"])

    for idx, p in enumerate(participants, start=1):
        ws.append([
            idx,
            p.last_name,
            p.first_name,
            p.middle_name or "",
            p.group,
            p.vk_link,
            p.unique_code,
            "Присутствовал" if p.visited else "Не явился"
        ])

    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)

    filename = f"{event.name.replace(' ', '_')}_участники.xlsx"
    return send_file(
        stream,
        as_attachment=True,
        download_name=filename,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
