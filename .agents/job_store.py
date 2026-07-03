"""
job_store.py — Persistent job store for the AI pipeline.

Jobs were previously held in a plain in-memory dict (`jobs: dict[str, dict]`),
which meant every job was lost on a service restart or redeploy. This module
persists jobs to the same Upstash Redis instance the Node app already uses
(UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN), so no new infrastructure
is required.

Falls back to an in-memory dict automatically if Redis credentials are not
configured, so local development without Redis still works.
"""

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

JOB_TTL_SECONDS = 24 * 60 * 60  # keep completed/failed jobs for 24h, same as Node's metrics TTL
JOB_KEY_PREFIX = "cg:job:"


class JobStore:
    """Redis-backed job store with an in-memory fallback."""

    def __init__(self):
        self._redis = None
        self._memory: dict[str, dict] = {}

        url = os.getenv("UPSTASH_REDIS_REST_URL")
        token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
        if url and token:
            try:
                from upstash_redis import Redis
                self._redis = Redis(url=url, token=token)
                logger.info("[JobStore] Using Upstash Redis for job persistence")
            except Exception as e:
                logger.warning(f"[JobStore] Failed to init Redis client, falling back to memory: {e}")
        else:
            logger.warning("[JobStore] UPSTASH_REDIS_REST_URL/TOKEN not set — jobs will NOT survive a restart")

    def _key(self, job_id: str) -> str:
        return f"{JOB_KEY_PREFIX}{job_id}"

    def set(self, job_id: str, job: dict) -> None:
        if self._redis is not None:
            try:
                self._redis.set(self._key(job_id), json.dumps(job), ex=JOB_TTL_SECONDS)
                return
            except Exception as e:
                logger.error(f"[JobStore] Redis set failed for {job_id}, falling back to memory: {e}")
        self._memory[job_id] = job

    def get(self, job_id: str) -> Optional[dict]:
        if self._redis is not None:
            try:
                raw = self._redis.get(self._key(job_id))
                if raw is not None:
                    return json.loads(raw)
                return None
            except Exception as e:
                logger.error(f"[JobStore] Redis get failed for {job_id}, falling back to memory: {e}")
        return self._memory.get(job_id)

    def update(self, job_id: str, **fields) -> None:
        job = self.get(job_id) or {}
        job.update(fields)
        self.set(job_id, job)


jobs = JobStore()
