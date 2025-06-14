# Use an official Python runtime as a parent image
FROM python:3.11-slim

WORKDIR /app

COPY . /app

RUN pip install --upgrade pip && \
    pip install .

CMD ["python", "main.py"]
