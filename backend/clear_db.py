import psycopg2

conn_string = "host=localhost dbname=kargoguard_db user=kargo_admin password=kargo_password"

try:
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    
    # Tüm tabloyu boşalt ve ID'leri (primary key) 1'den başlat!
    cur.execute("TRUNCATE TABLE cargo_analysis_results RESTART IDENTITY;")
    conn.commit()
    
    print("Mükemmel! 'cargo_analysis_results' tablosu tamamen SIFIRLANDI.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Hata oluştu: {e}")
