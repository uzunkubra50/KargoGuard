import psycopg2

conn = psycopg2.connect(host='localhost', port=5432, user='kargo_admin', password='kargo_password', dbname='kargoguard_db')
cur = conn.cursor()
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='cargo_analysis_results';")
cols = [row[0] for row in cur.fetchall()]
print(cols)

missing = ["gemini_hasar_turu", "gemini_siddet", "gemini_aciklama", "gemini_guven_skoru", "bbox_json", "security_breach"]
for col in missing:
    if col not in cols:
        print(f"Missing: {col}")
        # Add it now to be sure
        cur.execute(f"ALTER TABLE cargo_analysis_results ADD COLUMN IF NOT EXISTS {col} TEXT;")
cur.execute("ALTER TABLE cargo_analysis_results ADD COLUMN IF NOT EXISTS security_breach BOOLEAN DEFAULT false;")
conn.commit()
print("Fix applied.")
