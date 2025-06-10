import sqlite3
from flask import Blueprint, request, jsonify
from db import get_db
from log import log_user_action
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username, password = data.get('username'), data.get('password')

    if not username or not password:
        return jsonify({"error": "Все поля обязательны для заполнения"}), 400

    if len(password) < 1:
        return jsonify({"error": "Пароль должен содержать хотя бы 4 символа"}), 400

    hashed_password = generate_password_hash(password)

    with get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_password))
            conn.commit()
            log_user_action(cursor.lastrowid, "Регистрация пользователя.")
            return jsonify({"message": "Регистрация успешна"}), 201
        except sqlite3.IntegrityError:
            return jsonify({"error": "Пользователь уже существует"}), 400


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username, password = data.get('username'), data.get('password')

    if not username or not password:
        return jsonify({"error": "Все поля обязательны для заполнения"}), 400

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id, password FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password'], password):
            log_user_action(user['id'], "Вход в систему.")
            return jsonify({"message": "Вход выполнен", "user_id": user['id']})
        else:
            return jsonify({"error": "Неверные учетные данные"}), 401
