FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

WORKDIR /app/model

# Train model at build time (uses ml/data/order_history.csv)
RUN python train.py

EXPOSE 8001

CMD ["uvicorn", "predict:app", "--host", "0.0.0.0", "--port", "8001"]
