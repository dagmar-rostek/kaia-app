FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir pip --upgrade
COPY pyproject.toml .
RUN pip install --no-cache-dir ".[dev]" && pip install --no-cache-dir .

FROM python:3.12-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    fonts-noto-core \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN addgroup --system kaia && adduser --system --ingroup kaia kaia
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY --from=builder /usr/local/bin/alembic /usr/local/bin/alembic
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
USER kaia
EXPOSE 8000
CMD ["./entrypoint.sh"]
