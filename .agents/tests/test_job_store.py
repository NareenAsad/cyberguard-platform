"""
Tests for job_store.py — the Redis-backed job persistence layer that replaced
the plain in-memory dict `main.py` used to hold pipeline job state.
"""

import json

import pytest

from job_store import JobStore


def test_falls_back_to_memory_when_redis_credentials_absent(monkeypatch):
    monkeypatch.delenv("UPSTASH_REDIS_REST_URL", raising=False)
    monkeypatch.delenv("UPSTASH_REDIS_REST_TOKEN", raising=False)

    store = JobStore()
    assert store._redis is None

    store.set("job-1", {"job_id": "job-1", "status": "queued"})
    assert store.get("job-1") == {"job_id": "job-1", "status": "queued"}
    assert store.get("missing-job") is None


def test_update_merges_fields_without_clobbering_existing_ones(monkeypatch):
    monkeypatch.delenv("UPSTASH_REDIS_REST_URL", raising=False)
    monkeypatch.delenv("UPSTASH_REDIS_REST_TOKEN", raising=False)

    store = JobStore()
    store.set("job-1", {"job_id": "job-1", "status": "queued", "result": None})
    store.update("job-1", status="completed", result={"threats": []})

    job = store.get("job-1")
    assert job["status"] == "completed"
    assert job["result"] == {"threats": []}
    assert job["job_id"] == "job-1"  # untouched field survives the merge


class _FakeUpstashRedis:
    """Minimal stand-in for upstash_redis.Redis so tests don't hit the network."""

    def __init__(self, url=None, token=None):
        self._data: dict[str, str] = {}

    def set(self, key, value, ex=None):
        self._data[key] = value

    def get(self, key):
        return self._data.get(key)

    def delete(self, key):
        self._data.pop(key, None)


def test_uses_redis_client_when_credentials_present(monkeypatch):
    monkeypatch.setenv("UPSTASH_REDIS_REST_URL", "https://fake.upstash.io")
    monkeypatch.setenv("UPSTASH_REDIS_REST_TOKEN", "fake-token")
    monkeypatch.setattr("upstash_redis.Redis", _FakeUpstashRedis)

    store = JobStore()
    assert store._redis is not None

    store.set("job-2", {"job_id": "job-2", "status": "running"})
    assert store.get("job-2") == {"job_id": "job-2", "status": "running"}
    # Confirm it actually round-tripped through JSON serialization, not the dict directly.
    assert isinstance(store._redis._data["cg:job:job-2"], str)
    assert json.loads(store._redis._data["cg:job:job-2"])["status"] == "running"


def test_redis_failure_falls_back_to_memory_without_raising(monkeypatch):
    monkeypatch.setenv("UPSTASH_REDIS_REST_URL", "https://fake.upstash.io")
    monkeypatch.setenv("UPSTASH_REDIS_REST_TOKEN", "fake-token")

    class _BrokenRedis(_FakeUpstashRedis):
        def set(self, key, value, ex=None):
            raise ConnectionError("simulated Redis outage")

        def get(self, key):
            raise ConnectionError("simulated Redis outage")

    monkeypatch.setattr("upstash_redis.Redis", _BrokenRedis)

    store = JobStore()
    store.set("job-3", {"job_id": "job-3", "status": "queued"})
    # Should not raise, and should have fallen back to the in-memory dict.
    assert store.get("job-3") == {"job_id": "job-3", "status": "queued"}
