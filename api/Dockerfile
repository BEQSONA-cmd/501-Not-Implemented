FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY src/ ./src/
COPY data.json ./data.json

EXPOSE 8080

CMD ["python", "src/main.py"]
