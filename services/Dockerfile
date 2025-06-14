# Use an official Python runtime as a parent image
FROM python:3.11-slim

WORKDIR /app

COPY . /app

# Install system dependencies for psycopg (libpq) and build tools
RUN apt-get update && \
    apt-get install -y gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

CMD ["python", "main.py"]
