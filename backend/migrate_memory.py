import sqlite3
import os

DB_PATH = "backbone.db"  # Adjust if your DB path is different

def add_column():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(memory_traces)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "document_content" not in columns:
            print("Adding document_content column to memory_traces...")
            cursor.execute("ALTER TABLE memory_traces ADD COLUMN document_content TEXT")
            conn.commit()
            print("Column added successfully.")
        else:
            print("Column document_content already exists.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_column()
