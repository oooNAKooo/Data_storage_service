import sqlite3

DATABASE = 'storage.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row 
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          username TEXT UNIQUE NOT NULL,
                          password TEXT NOT NULL)''')
        cursor.execute('''CREATE TABLE IF NOT EXISTS items (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          user_id INTEGER NOT NULL,
                          name TEXT NOT NULL,
                          quantity INTEGER NOT NULL,
                          note TEXT, 
                          FOREIGN KEY(user_id) REFERENCES users(id))''')
        conn.commit()
