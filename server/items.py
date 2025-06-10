from flask import Blueprint, request, jsonify
from db import get_db
from log import log_user_action

items_bp = Blueprint('items', __name__)


@items_bp.route('/items/<int:user_id>', methods=['GET'])
def get_items(user_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, quantity, note FROM items WHERE user_id = ?', (user_id,))
        items = [{'id': row[0], 'name': row[1], 'quantity': row[2], 'note': row[3]} for row in cursor.fetchall()]
    return jsonify(items)


@items_bp.route('/items/<int:user_id>', methods=['POST'])
def add_item(user_id):
    data = request.json
    name = data.get('name')
    quantity = data.get('quantity')
    note = data.get('note', '')
    if len(name) > 10:
        return jsonify({"error": "Название элемента не может превышать 10 символов"}), 400
    try:
        quantity = int(quantity)
    except ValueError:
        return jsonify({"error": "Количество должно быть числом"}), 400
    if quantity < 0 or quantity > 99999:
        return jsonify({"error": "Количество должно быть в пределах от 0 до 99999"}), 400
    if note and len(note.strip()) == 0:
        return jsonify({"error": "Примечание не может быть пустым"}), 400
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO items (user_id, name, quantity, note) VALUES (?, ?, ?, ?)',
                       (user_id, name, quantity, note))
        conn.commit()
        item_id = cursor.lastrowid
    log_user_action(user_id, f"Добавлен элемент: {name}, количество: {quantity}, примечание: {note}.")
    return jsonify({"message": "Элемент добавлен", "item_id": item_id}), 200


@items_bp.route('/items/<int:user_id>/<int:item_id>', methods=['DELETE'])
def delete_item(user_id, item_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT name, quantity FROM items WHERE id = ? AND user_id = ?', (item_id, user_id))
        item = cursor.fetchone()

        if item:
            name, quantity = item
            cursor.execute('DELETE FROM items WHERE id = ? AND user_id = ?', (item_id, user_id))
            conn.commit()
            log_user_action(user_id, f"Удален элемент: {name}, количество: {quantity}.")
            return jsonify({"message": "Элемент удален"}), 200
        else:
            return jsonify({"message": "Элемент не найден"}), 404


@items_bp.route('/items/<int:user_id>/<int:item_id>', methods=['PUT'])
def update_item(user_id, item_id):
    data = request.json
    if not data or 'name' not in data or 'quantity' not in data:
        return jsonify({'error': 'Некорректные данные'}), 400

    new_name = data['name']
    new_quantity = data['quantity']
    new_note = data.get('note', '')

    # Проверка длины названия элемента
    if len(new_name) > 10:
        return jsonify({"error": "Название элемента не может превышать 10 символов"}), 400

    # Проверка количества
    try:
        new_quantity = int(new_quantity)
    except ValueError:
        return jsonify({"error": "Количество должно быть числом"}), 400

    if new_quantity < 0 or new_quantity > 99999:
        return jsonify({"error": "Количество должно быть в пределах от 0 до 99999"}), 400

    if new_note and len(new_note.strip()) == 0:
        return jsonify({"error": "Примечание не может быть пустым"}), 400

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT user_id FROM items WHERE id = ?', (item_id,))
        item = cursor.fetchone()

        if not item:
            return jsonify({'error': 'Элемент не найден'}), 404

        if item[0] != user_id:
            return jsonify({'error': 'Нет доступа к этому элементу'}), 403

        cursor.execute(
            'UPDATE items SET name = ?, quantity = ?, note = ? WHERE id = ? AND user_id = ?',
            (new_name, new_quantity, new_note, item_id, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'error': 'Не удалось обновить элемент'}), 404

    log_user_action(user_id, f"Элемент {new_name} обновлен. Количество изменено на {new_quantity}.")
    return jsonify({'message': 'Элемент обновлен'}), 200


@items_bp.route('/items/<int:user_id>/<int:item_id>', methods=['POST'])
def log_calculation(user_id):
    data = request.get_json()

    item_name = data.get('itemName')
    initial_quantity = data.get('initialQuantity')
    plus_per_day = data.get('plusPerDay')
    minus_per_day = data.get('minusPerDay')
    days = data.get('days')
    result = data.get('result')

    action = (
        f"Проведён расчёт для элемента '{item_name}': начальное кол-во: {initial_quantity}, "
        f"+в день: {plus_per_day}, -в день: {minus_per_day}, за {days} дней => результат: {result}."
    )

    log_user_action(user_id, action)

    return jsonify({"status": "ok", "message": "Лог расчёта записан"})
