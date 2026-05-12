import psycopg2
import os

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "KargoGuard.AI", ".env"))
except ImportError:
    pass

conn_string = (
    f"host={os.getenv('DB_HOST', 'localhost')} "
    f"dbname={os.getenv('DB_NAME', 'kargoguard_db')} "
    f"user={os.getenv('DB_USER', '')} "
    f"password={os.getenv('DB_PASSWORD', '')}"
)

try:
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(conn_string)
    cur  = conn.cursor()
    cur.execute("TRUNCATE TABLE cargo_analysis_results RESTART IDENTITY;")
    conn.commit()
    print("Mükemmel! 'cargo_analysis_results' tablosu tamamen SIFIRLANDI.")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Hata oluştu: {e}")
