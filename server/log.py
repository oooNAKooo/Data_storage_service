import os
from datetime import datetime
from db import get_db


def log_user_action(user_id, action):
    log_dir = 'user_logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()

    username = user[0] if user else 'unknown_user'
    log_file_path = os.path.join(log_dir, f'{username}_log.txt')
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if not os.path.exists(log_file_path):
        with open(log_file_path, 'w') as log_file:
            log_file.write(f'{current_time} - {action} (созданный лог)\n')
    else:
        with open(log_file_path, 'a') as log_file:
            log_file.write(f'{current_time} - {action}\n')
