FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıkları (OCR + image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App
COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["python", "main.py"]
