import pika
import json

RABBITMQ_HOST = "localhost"
RABBITMQ_PORT = 5672
RABBITMQ_USERNAME = "kargo_admin"
RABBITMQ_PASSWORD = "kargo_password"
QUEUE_NAME = "image_processing_queue"

# Sahte Kargo Verisi
test_verisi = {
    "image_path": "test_kutu.jpg",  # MinIO'da olmayan hayali bir resim
    "sarsinti_verisi": 6.5,         # 5G'den büyük, yani hasarlı demesi lazım
    "status": "Pending"
}

# RabbitMQ'ya Bağlan
credentials = pika.PlainCredentials(RABBITMQ_USERNAME, RABBITMQ_PASSWORD)
connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials))
channel = connection.channel()
channel.queue_declare(queue=QUEUE_NAME, durable=True)

# Mesajı Gönder
channel.basic_publish(
    exchange='',
    routing_key=QUEUE_NAME,
    body=json.dumps(test_verisi),
    properties=pika.BasicProperties(delivery_mode=2) # Kalıcı mesaj
)

print(f" [x] Test mesajı gönderildi: {test_verisi}")
connection.close()