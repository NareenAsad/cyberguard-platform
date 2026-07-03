"""
Tests for the pipeline's rate-limit retry/resume logic in crew.py's run().

Context: the original implementation retried a rate-limit failure by calling
c.kickoff() again, which restarts CrewAI's 5-agent sequential process from
task 1 every time. If the rate limit hit on task 4 or 5 (the largest, most
context-heavy tasks — and so the most likely place to hit a TPM cap), a
single retry re-spent all the tokens already used on tasks 1-3, and up to
`max_retries` retries could multiply a run's token cost several times over.

The fix uses CrewAI's built-in Crew.replay(task_id, ...), which resumes from
a specific already-completed task instead of task 1 (see crewai's own
crew.py: _task_output_handler persists each task's output to a local SQLite
file as it completes, and replay() reloads it). These tests mock the Crew
object entirely — a real pipeline run would cost real Groq tokens, exactly
what this fix is meant to reduce, so we verify the *control flow* (does it
call kickoff vs. replay, with what task_id) rather than run the real
CrewAI/Groq stack.
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
    runner.llm = MagicMock()
    runner.llm.get_token_usage_summary.return_value = UsageMetrics(
        total_tokens=0, prompt_tokens=0, completion_tokens=0,
        cached_prompt_tokens=0, successful_requests=0,
    )
    runner.llm_powerful = runner.llm
    runner._usage_checkpoint = 0
    return runner


def fake_crew_output():
    """CrewOutput-shaped stand-in; empty tasks_output makes run()'s
    aggregation step a no-op so these tests stay focused on retry control flow."""
    return SimpleNamespace(tasks_output=[], raw="{}")


def rate_limit_error() -> Exception:
    return Exception("Error code: 429 - rate_limit_exceeded: tokens per minute limit reached")


@patch("crew.time.sleep")  # don't actually wait through the 60s/120s/180s backoff
def test_first_attempt_success_never_touches_replay(mock_sleep):
    runner = make_runner()
    mock_crew = MagicMock()
    mock_crew.tasks = [MagicMock() for _ in range(5)]
    mock_crew.kickoff.return_value = fake_crew_output()
    runner.crew = MagicMock(return_value=mock_crew)

    result = runner.run([], [])

    mock_crew.kickoff.assert_called_once()
    mock_crew.replay.assert_not_called()
    assert "error" not in result
    assert "token_usage" in result["metadata"]


@patch("crew.time.sleep")
def test_rate_limit_with_partial_progress_resumes_instead_of_restarting(mock_sleep):
    runner = make_runner()
    mock_crew = MagicMock()
    mock_crew.tasks = [MagicMock() for _ in range(5)]
    # kickoff() fails after 2 of 5 tasks completed (stored in CrewAI's checkpoint).
    mock_crew.kickoff.side_effect = rate_limit_error()
    mock_crew._task_output_handler.load.return_value = [
        {"task_id": "task-1-id"},
        {"task_id": "task-2-id"},
    ]
    mock_crew.replay.return_value = fake_crew_output()
    runner.crew = MagicMock(return_value=mock_crew)

    result = runner.run([], [])

    # kickoff() was only ever tried once — the retry used replay(), not a
    # second full restart via kickoff().
    mock_crew.kickoff.assert_called_once()
    mock_crew.replay.assert_called_once()
    # Resumes from the LAST completed task (re-runs it + everything after —
    # replay()'s own semantics), not from task 1.
    assert mock_crew.replay.call_args.kwargs["task_id"] == "task-2-id"
    assert "error" not in result


@patch("crew.time.sleep")
def test_rate_limit_with_zero_progress_falls_back_to_fresh_kickoff(mock_sleep):
    runner = make_runner()

    mock_crew_1 = MagicMock()
    mock_crew_1.tasks = [MagicMock() for _ in range(5)]
    mock_crew_1.kickoff.side_effect = rate_limit_error()
    mock_crew_1._task_output_handler.load.return_value = []  # task 1 itself failed

    mock_crew_2 = MagicMock()
    mock_crew_2.kickoff.return_value = fake_crew_output()

    runner.crew = MagicMock(side_effect=[mock_crew_1, mock_crew_2])

    result = runner.run([], [])

    # Nothing had completed, so there's nothing to resume — a fresh kickoff
    # is the only option (and the cheapest one, since nothing was wasted).
    mock_crew_1.replay.assert_not_called()
    mock_crew_2.kickoff.assert_called_once()
    assert "error" not in result


@patch("crew.time.sleep")
def test_non_rate_limit_exception_raises_immediately_without_retry(mock_sleep):
    runner = make_runner()
    mock_crew = MagicMock()
    mock_crew.tasks = [MagicMock() for _ in range(5)]
    mock_crew.kickoff.side_effect = ValueError("some unrelated bug, not a rate limit")
    runner.crew = MagicMock(return_value=mock_crew)

    with pytest.raises(ValueError):
        runner.run([], [])

    mock_crew.kickoff.assert_called_once()
    mock_crew.replay.assert_not_called()


@patch("crew.time.sleep")
def test_exhausting_all_retries_returns_error_with_token_usage(mock_sleep):
    runner = make_runner()
    mock_crew = MagicMock()
    mock_crew.tasks = [MagicMock() for _ in range(5)]
    mock_crew.kickoff.side_effect = rate_limit_error()
    mock_crew._task_output_handler.load.return_value = []
    # Every fallback "fresh crew" also fails, exhausting max_retries.
    runner.crew = MagicMock(return_value=mock_crew)

    result = runner.run([], [])

    assert "error" in result
    assert "token_usage" in result
