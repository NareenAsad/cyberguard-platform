"""
Tests for the pipeline's rate-limit retry logic in crew.py's run().

Context: a rate-limited request retries with a fresh Crew() + kickoff() each
attempt. An earlier version tried to resume from the last completed task via
CrewAI's Crew.replay(task_id, ...) instead of redoing the whole pipeline, but
in production this didn't work: CrewAI's _task_output_handler only updates
pre-existing storage rows, so newly-completed tasks during a replay were
never persisted ("No row found ... No update performed"), and every retry
silently resumed from the SAME original task every time — while also
appearing to accumulate conversation context across attempts, making each
"resume" more expensive than the last (Task 1's prompt grew from 2170 to
5199 to 13524 tokens across three retries of the same run). A plain fresh
kickoff() gets the same real-world "start over" outcome without that
ballooning-context tax, so that's what run() does now.

These tests mock the Crew object entirely — a real pipeline run would cost
real Groq tokens, exactly what this logic is meant to manage carefully, so we
verify the *control flow* (how many times crew()/kickoff() get called, and
under what conditions) rather than run the real CrewAI/Groq stack.
"""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from crewai.types.usage_metrics import UsageMetrics

from crew import CyberguardThreatIntelligenceIncidentResponseCrew


def make_runner() -> CyberguardThreatIntelligenceIncidentResponseCrew:
    """Build a runner without calling __init__ (which constructs a real LLM)."""
    runner = CyberguardThreatIntelligenceIncidentResponseCrew.__new__(
        CyberguardThreatIntelligenceIncidentResponseCrew
    )
    runner.verbose = True

    def make_llm_mock():
        m = MagicMock()
        m.get_token_usage_summary.return_value = UsageMetrics(
            total_tokens=0, prompt_tokens=0, completion_tokens=0,
            cached_prompt_tokens=0, successful_requests=0,
        )
        return m

    runner.llm = make_llm_mock()
    runner.llm_powerful = make_llm_mock()
    runner._usage_checkpoint = 0
    runner._task_call_count = 0
    return runner


def fake_crew_output():
    """CrewOutput-shaped stand-in; empty tasks_output makes run()'s
    aggregation step a no-op so these tests stay focused on retry control flow."""
    return SimpleNamespace(tasks_output=[], raw="{}")


def rate_limit_error() -> Exception:
    return Exception("Error code: 429 - rate_limit_exceeded: tokens per minute limit reached")


@patch("crew.time.sleep")
def test_first_attempt_success(mock_sleep):
    runner = make_runner()
    mock_crew = MagicMock()
    mock_crew.kickoff.return_value = fake_crew_output()
    runner.crew = MagicMock(return_value=mock_crew)

    result = runner.run([], [])

    runner.crew.assert_called_once()
    mock_crew.kickoff.assert_called_once()
    assert "error" not in result
    assert "token_usage" in result["metadata"]


@patch("crew.time.sleep")
def test_rate_limit_retries_with_a_fresh_crew_and_kickoff_each_attempt(mock_sleep):
    runner = make_runner()
    failing_crew = MagicMock()
    failing_crew.kickoff.side_effect = rate_limit_error()
    succeeding_crew = MagicMock()
    succeeding_crew.kickoff.return_value = fake_crew_output()
    # Fails on the first two attempts; a fresh Crew() on the third succeeds.
    runner.crew = MagicMock(side_effect=[failing_crew, failing_crew, succeeding_crew])

    result = runner.run([], [])

    # A brand new Crew() (and a brand new kickoff()) every single attempt —
    # no replay(), no resume, no reuse of a prior Crew object.
    assert runner.crew.call_count == 3
    assert failing_crew.kickoff.call_count == 2
    succeeding_crew.kickoff.assert_called_once()
    assert "error" not in result


@patch("crew.time.sleep")
def test_non_rate_limit_exception_raises_immediately_without_retry(mock_sleep):
    runner = make_runner()
    mock_crew = MagicMock()
    mock_crew.kickoff.side_effect = ValueError("some unrelated bug, not a rate limit")
    runner.crew = MagicMock(return_value=mock_crew)

    with pytest.raises(ValueError):
        runner.run([], [])

    mock_crew.kickoff.assert_called_once()


@patch("crew.time.sleep")
def test_exhausting_all_retries_returns_error_with_token_usage(mock_sleep):
    runner = make_runner()
    mock_crew = MagicMock()
    mock_crew.kickoff.side_effect = rate_limit_error()
    # Every fresh crew() also hits the rate limit, exhausting max_retries.
    runner.crew = MagicMock(return_value=mock_crew)

    result = runner.run([], [])

    assert runner.crew.call_count == 4
    assert mock_crew.kickoff.call_count == 4
    assert "error" in result
    assert "token_usage" in result
