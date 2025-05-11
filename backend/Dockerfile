FROM python:3.9-slim AS builder
WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y --no-install-recommends gcc libc-dev libpq-dev \
    && pip install --no-cache-dir --user -r requirements.txt \
    && apt-get purge -y --auto-remove gcc libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Final stage
FROM python:3.9-slim
WORKDIR /app

# Install libpq5 for runtime
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app
RUN chmod -R 755 /app
EXPOSE 8000
CMD uvicorn main:app --host 0.0.0.0 --port $PORT