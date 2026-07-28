import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const rawPythonUrl = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8000"
const PYTHON_AI_SERVICE = rawPythonUrl.endsWith('/') ? rawPythonUrl.slice(0, -1) : rawPythonUrl

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/agents/analyze
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const runId = `cg-${Date.now()}`;

        // 1. Fetch latest threat indicators from the database (via internal API)
        const indicatorsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/threats?limit=100&hours=24`);
        const indicators = indicatorsRes.ok ? await indicatorsRes.json() : [];

        // 2. Fetch asset inventory from Supabase
        const { data: assets, error: assetError } = await supabase
            .from("assets")
            .select("*")
            .eq("active", true);

        if (assetError) {
            console.error("[Agents] Failed to fetch assets:", assetError);
            return NextResponse.json({ error: "Failed to fetch asset inventory" }, { status: 500 });
        }

        // 3. Call Python AI service
        const aiResponse = await fetch(`${PYTHON_AI_SERVICE}/api/agents/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                run_id: runId,
                indicators: indicators.data || indicators,
                assets: assets || [],
            }),
        });

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            console.error("[Agents] AI service error:", errText);
            return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
        }

        const job = await aiResponse.json();

        // 4. Store job reference in Supabase for tracking
        await supabase.from("agent_jobs").insert({
            job_id: job.job_id,
            status: job.status,
            created_at: job.created_at,
            indicators_count: indicators.length,
            assets_count: assets?.length || 0,
        });

        return NextResponse.json({ jobId: job.job_id, status: job.status });

    } catch (error) {
        console.error("[Agents] Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


// GET /api/agents/analyze?jobId=cg-xxx
export async function GET(req: NextRequest) {
    const jobId = req.nextUrl.searchParams.get("jobId");
    if (!jobId) {
        return NextResponse.json({ error: "jobId query param required" }, { status: 400 });
    }

    try {
        // Poll Python service for job status
        const statusRes = await fetch(`${PYTHON_AI_SERVICE}/api/agents/jobs/${jobId}`);

        if (!statusRes.ok) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        const job = await statusRes.json();

        // If completed, store results in Supabase and push to Socket.io
        if (job.status === "completed" && job.result) {
            await storeResults(jobId, job.result);
            await pushToSocket(job.result);
        }

        return NextResponse.json(job);

    } catch (error) {
        console.error("[Agents] Status check error:", error);
        return NextResponse.json({ error: "Failed to check job status" }, { status: 500 });
    }
}

// Helpers

async function storeResults(jobId: string, result: any) {
    try {
        // Store risk register
        if (result.risk_register?.length) {
            const rows = result.risk_register.map((r: any) => ({
                job_id: jobId,
                cve_id: r.cveId,
                asset_id: r.assetId,
                risk_score: r.riskScore,
                severity_label: r.severityLabel,
                score_breakdown: r.scoreBreakdown,
                created_at: new Date().toISOString(),
            }));
            await supabase.from("risk_findings").insert(rows);
        }

        // Store generated playbooks
        if (result.playbooks?.length) {
            const rows = result.playbooks.map((p: any) => ({
                job_id: jobId,
                cve_id: p.cveId,
                asset_id: p.assetId,
                risk_score: p.riskScore,
                playbook: p.playbook,
                created_at: new Date().toISOString(),
            }));
            await supabase.from("playbooks").insert(rows);
        }

        // Update job status
        await supabase
            .from("agent_jobs")
            .update({ status: "completed", completed_at: new Date().toISOString() })
            .eq("job_id", jobId);

    } catch (e) {
        console.error("[Agents] Failed to store results:", e);
    }
}

async function pushToSocket(result: any) {
    // Emit to Socket.io server so dashboard updates in real-time
    try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/socket/emit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: "agent:analysis_complete",
                data: {
                    critical: result.reports?.executive_report?.severity_summary?.critical || 0,
                    high: result.reports?.executive_report?.severity_summary?.high || 0,
                    topRisks: result.risk_register?.slice(0, 3) || [],
                    newPlaybooks: result.playbooks?.length || 0,
                },
            }),
        });
    } catch (e) {
        console.warn("[Agents] Socket push failed (non-critical):", e);
    }
}