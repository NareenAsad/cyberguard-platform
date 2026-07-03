FROM python:3.11-slim

# ── System dependencies ───────────────────────────────────────────
# gcc + libffi needed to compile some CrewAI/pydantic native wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Working directory ─────────────────────────────────────────────
WORKDIR /app

# ── Install Python dependencies first (layer cached unless requirements change) ──
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ── Copy application code ─────────────────────────────────────────
COPY crew.py tools.py main.py risk_engine_py.py job_store.py ./
COPY config/ ./config/
COPY data/ ./data/

# ── Runtime config ────────────────────────────────────────────────
# All secrets are injected at runtime via --env-file or -e flags.
# Never bake API keys into the image.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8001

EXPOSE 8001

# ── Health check ──────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# ── Start server ──────────────────────────────────────────────────
# --host 0.0.0.0  → bind to all interfaces (required inside Docker)
# --workers 1     → job store is now Redis-backed (job_store.py) so this is no
#                   longer a correctness requirement, just the current default
# No --reload in production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
