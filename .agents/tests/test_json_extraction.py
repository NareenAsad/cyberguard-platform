"""
Tests for crew.py's _extract_json — the function that parses LLM output into
structured data. LLMs frequently wrap JSON in prose or markdown fences instead
of returning raw JSON, so this needs to be robust to real-world Groq output,
not just textbook-clean JSON.
"""

import pytest

from crew import _extract_json


def test_direct_json_object():
    assert _extract_json('{"a": 1, "b": "two"}') == {"a": 1, "b": "two"}


def test_direct_json_array():
    assert _extract_json('[{"cve": "CVE-2021-44228"}]') == [{"cve": "CVE-2021-44228"}]


def test_markdown_fenced_json():
    text = '''Here is the analysis:
```json
{"threats": [{"id": "CVE-2021-44228", "severity": "CRITICAL"}]}
```
Let me know if you need more detail.'''
    assert _extract_json(text) == {"threats": [{"id": "CVE-2021-44228", "severity": "CRITICAL"}]}


def test_markdown_fenced_json_uppercase_tag():
    text = '```JSON\n{"ok": true}\n```'
    assert _extract_json(text) == {"ok": True}


def test_json_embedded_in_prose_without_fence():
    text = 'Sure, here is the result: {"score": 87, "label": "HIGH"} — hope that helps!'
    assert _extract_json(text) == {"score": 87, "label": "HIGH"}


def test_nested_braces_are_balanced_correctly():
    text = 'Result: {"outer": {"inner": {"deep": 1}}, "list": [1, 2, 3]} done.'
    assert _extract_json(text) == {"outer": {"inner": {"deep": 1}}, "list": [1, 2, 3]}


def test_braces_inside_string_values_do_not_break_balancing():
    text = '{"note": "use format like {key: value} in your config", "count": 2}'
    assert _extract_json(text) == {"note": "use format like {key: value} in your config", "count": 2}


def test_escaped_quotes_inside_string_values():
    text = '{"quote": "She said \\"hello\\" to me"}'
    assert _extract_json(text) == {"quote": 'She said "hello" to me'}


def test_unparseable_text_returns_none():
    assert _extract_json("This is just plain prose with no JSON at all.") is None


def test_empty_string_returns_none():
    assert _extract_json("") is None
    assert _extract_json(None) is None


def test_array_of_objects_in_prose():
    text = 'Playbooks generated: [{"title": "Contain Ransomware"}, {"title": "Isolate Host"}] — 2 total.'
    result = _extract_json(text)
    assert len(result) == 2
    assert result[0]["title"] == "Contain Ransomware"
