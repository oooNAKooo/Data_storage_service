from flask import Blueprint, send_file, abort
import sqlite3
from openpyxl import Workbook
from io import BytesIO
from log import log_user_action

export_excel_bp = Blueprint('export_excel', __name__)


@export_excel_bp.route('/export_excel/<int:user_id>', methods=['GET'])
def export_excel(user_id):
    with sqlite3.connect('storage.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()

    if not user:
        abort(404, description="Пользователь не найден")

    username = user[0]

    with sqlite3.connect('storage.db') as conn:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT name, COALESCE(quantity, ""), COALESCE(note, "") FROM items WHERE user_id = ?',
            (user_id,)
        )
        items = cursor.fetchall()

    wb = Workbook()
    ws = wb.active
    ws.title = "Items"
    ws.append(["Название", "Количество", "Примечание"])

    for item in items:
        name = item[0] if item[0] else "Не указано"
        quantity = item[1] if item[1] else "Не указано"
        note = item[2] if item[2] else "Не указано"
        ws.append([name, quantity, note])

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    filename = f"{username}_экспорт.xlsx"

    log_user_action(user_id, f"Выполнен экспорт данных в формате excel.")

    return send_file(
        output,
        as_attachment=True,
        download_name=filename,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
