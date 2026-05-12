import psycopg2
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "5432")),
    user=os.getenv("DB_USER", ""),
    password=os.getenv("DB_PASSWORD", ""),
    dbname=os.getenv("DB_NAME", "kargoguard_db")
)
cur = conn.cursor()
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='cargo_analysis_results';")
cols = [row[0] for row in cur.fetchall()]
print(cols)

missing = ["gemini_hasar_turu", "gemini_siddet", "gemini_aciklama", "gemini_guven_skoru", "bbox_json", "security_breach"]
for col in missing:
    if col not in cols:
        print(f"Missing: {col}")
        cur.execute(f"ALTER TABLE cargo_analysis_results ADD COLUMN IF NOT EXISTS {col} TEXT;")
cur.execute("ALTER TABLE cargo_analysis_results ADD COLUMN IF NOT EXISTS security_breach BOOLEAN DEFAULT false;")
conn.commit()
print("Fix applied.")
