import sqlite3
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash
from log import log_user_action

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/users', methods=['GET'])
def get_users():
    with sqlite3.connect('storage.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id, username FROM users')
        users = [{'id': row[0], 'username': row[1]} for row in cursor.fetchall()]
    return jsonify(users)


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    with sqlite3.connect('storage.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        if user is None:
            return jsonify({"error": "Пользователь не найден"}), 404
        username = user[0]
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
    log_user_action(user_id, f"Удален пользователь {username}")
    return jsonify({"message": "Пользователь удален"}), 200


@admin_bp.route('/users/<int:user_id>/password', methods=['PUT'])
def update_password(user_id):
    data = request.json
    if not data or 'password' not in data:
        return jsonify({"error": "Отсутствует 'password' в запросе"}), 400

    new_password = data['password']
    hashed_password = generate_password_hash(new_password)

    with sqlite3.connect("storage.db") as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, user_id))
        if cursor.rowcount == 0:
            return jsonify({"error": "Пользователь не найден"}), 404
        conn.commit()
    log_user_action(user_id, "Пароль обновлен администратором.")
    return jsonify({'success': False, 'message': 'Пароль успешно обновлён'})
