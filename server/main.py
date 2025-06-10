from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from items import items_bp
from export import export_bp
from admin import admin_bp
from export_excel import export_excel_bp
from db import init_db
from import_excel import import_excel_bp

app = Flask(__name__)
CORS(app)

init_db()
app.register_blueprint(import_excel_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(items_bp)
app.register_blueprint(export_bp)
app.register_blueprint(export_excel_bp)
app.register_blueprint(admin_bp, url_prefix='/admin')

if __name__ == '__main__':
    app.run(debug=True)
