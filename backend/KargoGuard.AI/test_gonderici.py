import pika
import json
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

RABBITMQ_HOST     = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT     = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USERNAME = os.getenv("RABBITMQ_USERNAME", "")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "")
QUEUE_NAME        = "image_processing_queue"

test_verisi = {
    "image_path":      "test_kutu.jpg",
    "sarsinti_verisi": 6.5,
    "status":          "Pending"
}

credentials = pika.PlainCredentials(RABBITMQ_USERNAME, RABBITMQ_PASSWORD)
connection  = pika.BlockingConnection(
    pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
)
channel = connection.channel()
channel.queue_declare(queue=QUEUE_NAME, durable=True)

channel.basic_publish(
    exchange='',
    routing_key=QUEUE_NAME,
    body=json.dumps(test_verisi),
    properties=pika.BasicProperties(delivery_mode=2)
)

print(f" [x] Test mesajı gönderildi: {test_verisi}")
connection.close()
