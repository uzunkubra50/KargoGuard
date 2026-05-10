import base64
from consumer import gemini_hasar_analiz

dummy_b64 = base64.b64encode(b"dummy image data perfectly legitimate").decode("utf-8")
res = gemini_hasar_analiz(dummy_b64, None, "text/plain")
print(res)
