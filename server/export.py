from flask import Blueprint, send_file, jsonify
from io import BytesIO
import sqlite3
import urllib.parse
from log import log_user_action

export_bp = Blueprint('export', __name__)


@export_bp.route('/export/<int:user_id>', methods=['GET'])
def export_items(user_id):
    with sqlite3.connect('storage.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()

    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    username = user[0]

    with sqlite3.connect('storage.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT name, COALESCE(quantity, ""), COALESCE(note, "") FROM items WHERE user_id = ?',
                       (user_id,))
        items = cursor.fetchall()

    content = ""
    for item in items:
        name = item[0] if item[0] else "Не указано"
        quantity = item[1] if item[1] else "Не указано"
        note = item[2] if item[2] else "Не указано"
        content += f"{name} - {quantity} - {note}\n"

    output = BytesIO()
    output.write(content.encode("utf-8"))
    output.seek(0)

    filename = f"{username}_экспорт.txt"
    encoded_filename = urllib.parse.quote(filename)

    log_user_action(user_id, f"Выполнен экспорт данных.")

    response = send_file(
        output,
        as_attachment=True,
        download_name=f"{username}_экспорт.txt",
        mimetype="text/plain"
    )
    response.headers["Content-Disposition"] = f"attachment; filename*=UTF-8''{encoded_filename}"
    return response
