import json
import logging
import re
from datetime import datetime, timezone
from tools import nvd_search_tool, otx_threat_tool

logger = logging.getLogger(__name__)


class CyberGuardCrew:
    def __init__(self, verbose: bool = True):
        self.verbose = verbose

    def run(self, raw_indicators: list[dict], asset_inventory: list[dict]) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        logger.info(f"[CyberGuard] Starting pipeline at {now}")
        logger.info(f"[CyberGuard] {len(raw_indicators)} indicators | {len(asset_inventory)} assets")

        try:
            threats = self._build_threats(raw_indicators)
            vulnerabilities = self._build_vulnerabilities(threats, asset_inventory)
            risk_register = self._build_risk_register(vulnerabilities)
            playbooks = self._build_playbooks(risk_register)
        except Exception as e:
            logger.error(f"[CyberGuard] Deterministic pipeline failed: {e}")
            return self._fallback_output(raw_indicators, asset_inventory, str(e))

        merged = {
            "metadata": {
                "run_id": f"cg-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "indicators_processed": len(raw_indicators),
                "assets_scanned": len(asset_inventory),
            },
            "threats": threats,
            "vulnerabilities": vulnerabilities,
            "risk_register": risk_register,
            "playbooks": playbooks,
        }
        return self._ensure_reports(merged)

    def _fallback_output(self, raw_indicators: list[dict], asset_inventory: list[dict], error: str) -> dict:
        """Graceful fallback when Groq repeatedly returns empty/invalid generations."""
        return {
            "metadata": {
                "run_id": f"cg-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "indicators_processed": len(raw_indicators),
                "assets_scanned": len(asset_inventory),
            },
            "threats": [],
            "vulnerabilities": [],
            "risk_register": [],
            "playbooks": [],
            "executive_report": {
                "posture_score": 0,
                "severity_summary": {"critical": 0, "high": 0, "medium": 0, "low": 0},
                "top_risk": "AI pipeline returned an empty model response.",
                "action_required": "Retry analysis shortly. If this persists, switch to groq/llama-3.1-70b-versatile.",
            },
            "technical_report": {
                "total_findings": 0,
                "cves_detected": [],
                "assets_at_risk": [],
                "immediate_patches": [],
            },
            "llm_error": error,
        }

    def _ensure_reports(self, payload: dict) -> dict:
        """Build deterministic reports to avoid high-token final LLM summarization."""
        if payload.get("executive_report") and payload.get("technical_report"):
            return payload

        threats = payload.get("threats") or []
        risks = payload.get("risk_register") or []
        playbooks = payload.get("playbooks") or []

        critical = sum(1 for r in risks if (r.get("risk_score") or 0) >= 70)
        high = sum(1 for r in risks if 50 <= (r.get("risk_score") or 0) < 70)
        medium = sum(1 for r in risks if 30 <= (r.get("risk_score") or 0) < 50)
        low = sum(1 for r in risks if (r.get("risk_score") or 0) < 30)

        max_risk = max((r.get("risk_score") or 0 for r in risks), default=0)
        top_item = next(iter(sorted(risks, key=lambda r: r.get("risk_score", 0), reverse=True)), None)
        top_risk_text = (
            f"Top risk: {top_item.get('cve_id', 'Unknown CVE')} on {top_item.get('asset_name', 'Unknown Asset')}"
            if top_item
            else "No actionable risk findings yet."
        )

        posture_score = max(0, 100 - (critical * 12 + high * 6 + medium * 3))
        action_required = (
            "Apply patches for critical findings immediately and isolate affected assets."
            if critical > 0
            else "Continue monitoring and rerun analysis after ingesting more indicators."
        )

        payload["executive_report"] = {
            "posture_score": posture_score,
            "severity_summary": {"critical": critical, "high": high, "medium": medium, "low": low},
            "top_risk": top_risk_text,
            "action_required": action_required,
        }
        payload["technical_report"] = {
            "total_findings": len(risks) or len(threats),
            "cves_detected": list({r.get("cve_id") for r in risks if r.get("cve_id")})[:20],
            "assets_at_risk": list({r.get("asset_name") for r in risks if r.get("asset_name")})[:20],
            "immediate_patches": [
                f"Patch {r.get('cve_id')}"
                for r in risks
                if r.get("cve_id") and ((r.get("risk_score") or 0) >= 70)
            ][:20],
            "generated_playbooks": len(playbooks),
        }
        return payload

    def _build_threats(self, raw_indicators: list[dict]) -> list[dict]:
        output = []
        for ind in raw_indicators:
            conf = int(ind.get("confidence") or 0)
            if conf < 60:
                continue

            value = ind.get("value", "")
            ind_type = ind.get("type", "unknown")
            otx_text = otx_threat_tool.run(value)
            pulse_count = self._extract_int(otx_text, r"OTX Pulse Count:\s*(\d+)", default=0)
            priority = min(100, max(conf, 40) + pulse_count * 4)

            output.append(
                {
                    "indicator_value": value,
                    "indicator_type": ind_type,
                    "confidence_score": conf,
                    "mitre_tactic": "Initial Access",
                    "mitre_technique_id": "T1190",
                    "active_exploitation": pulse_count > 0,
                    "priority_score": priority,
                }
            )
        return output

    def _build_vulnerabilities(self, threats: list[dict], assets: list[dict]) -> list[dict]:
        vulns = []
        cves = [t["indicator_value"] for t in threats if t.get("indicator_type") == "cve"]
        for cve in cves:
            nvd_text = nvd_search_tool.run(cve)
            cvss = self._extract_float(nvd_text, r"CVSS Score:\s*([0-9]+(?:\.[0-9]+)?)", default=7.5)
            patch_available = "NVD API error" not in nvd_text and "No CVEs found" not in nvd_text

            for asset in assets:
                vulns.append(
                    {
                        "asset_id": asset.get("id", "unknown"),
                        "asset_name": asset.get("name", "Unknown Asset"),
                        "asset_criticality": asset.get("criticality", "MEDIUM"),
                        "cve_id": cve,
                        "cvss_base_score": cvss,
                        "patch_available": patch_available,
                        "match_confidence": 85,
                        "affected_component": (asset.get("software") or [{}])[0].get("name", "Unknown Component"),
                    }
                )
        return vulns

    def _build_risk_register(self, vulnerabilities: list[dict]) -> list[dict]:
        crit_map = {"CRITICAL": 10, "HIGH": 7, "MEDIUM": 5, "LOW": 2}
        register = []
        for v in vulnerabilities:
            s_v = float(v.get("cvss_base_score") or 0)
            e_x = 10
            a_c = crit_map.get(str(v.get("asset_criticality", "MEDIUM")).upper(), 5)
            t_i = 8
            risk_score = min(100, ((0.30 * s_v) + (0.25 * e_x) + (0.25 * a_c) + (0.20 * t_i)) * 10)
            if risk_score >= 70:
                severity = "CRITICAL"
            elif risk_score >= 50:
                severity = "HIGH"
            elif risk_score >= 30:
                severity = "MEDIUM"
            else:
                severity = "LOW"

            register.append(
                {
                    "asset_id": v["asset_id"],
                    "asset_name": v["asset_name"],
                    "cve_id": v["cve_id"],
                    "risk_score": round(risk_score, 1),
                    "severity_label": severity,
                    "cvss_score": s_v,
                    "exploitability_score": e_x,
                    "asset_criticality_score": a_c,
                    "threat_intel_score": t_i,
                    "mitre_tactic": "Initial Access",
                    "patch_available": v.get("patch_available", False),
                }
            )
        return sorted(register, key=lambda r: r["risk_score"], reverse=True)

    def _build_playbooks(self, risk_register: list[dict]) -> list[dict]:
        playbooks = []
        for r in risk_register:
            if (r.get("risk_score") or 0) < 70:
                continue
            playbooks.append(
                {
                    "cve_id": r.get("cve_id"),
                    "asset_id": r.get("asset_id"),
                    "risk_score": r.get("risk_score"),
                    "playbook": {
                        "containment": [
                            "Isolate affected host from external network.",
                            "Block known IoCs at firewall/EDR immediately.",
                        ],
                        "eradication": [
                            "Apply vendor patch for the affected CVE.",
                            "Remove malicious persistence and reset credentials.",
                        ],
                        "recovery": [
                            "Restore services and validate with post-patch scan.",
                            "Increase monitoring for 24h and review logs.",
                        ],
                    },
                }
            )
        return playbooks

    @staticmethod
    def _extract_int(text: str, pattern: str, default: int = 0) -> int:
        m = re.search(pattern, text or "")
        return int(m.group(1)) if m else default

    @staticmethod
    def _extract_float(text: str, pattern: str, default: float = 0.0) -> float:
        m = re.search(pattern, text or "")
        return float(m.group(1)) if m else default


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    sample_indicators = [
        {"type": "cve", "value": "CVE-2021-44228", "source": "NVD", "confidence": 100},
        {"type": "ip",  "value": "45.33.32.156",   "source": "OTX", "confidence": 85},
    ]

    sample_assets = [
        {
            "id": "asset-001",
            "name": "Production Web Server",
            "ip_address": "10.0.1.10",
            "os": "Ubuntu 22.04",
            "software": [{"name": "Apache Log4j", "version": "2.14.0"}],
            "criticality": "CRITICAL",
            "network_exposure": "internet-facing",
        },
    ]

    crew_runner = CyberGuardCrew(verbose=True)
    output = crew_runner.run(sample_indicators, sample_assets)
    print(json.dumps(output, indent=2))