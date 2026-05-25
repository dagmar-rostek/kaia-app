FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir pip --upgrade
COPY pyproject.toml .
RUN pip install --no-cache-dir ".[dev]" && pip install --no-cache-dir .

FROM python:3.12-slim AS runner
WORKDIR /app
RUN addgroup --system kaia && adduser --system --ingroup kaia kaia
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY app/ ./app/
USER kaia
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
