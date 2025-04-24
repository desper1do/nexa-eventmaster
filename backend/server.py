#server.py
from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.participants import participants_bp
from routes.events import events_bp
from routes.export import export_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)

app.register_blueprint(participants_bp, url_prefix='/api')
app.register_blueprint(events_bp, url_prefix='/api')
app.register_blueprint(export_bp, url_prefix='/api')

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
