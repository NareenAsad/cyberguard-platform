# Backend Documentation (docs/BACKEND.md)

CyberGuard's backend is implemented entirely with **Next.js API Routes**. No separate server process is required; the API lives under `src/app/api/`.

## Architecture
- All endpoints follow a **DB‑first** pattern. If Supabase is reachable, data is fetched from the real database. If not, the endpoint falls back to built‑in mock data and adds the HTTP header `X-Data-Source: mock`.
- Requests are **type‑safe** with TypeScript definitions.
- **Authentication** is handled via Supabase Auth; the session token is verified on each request.

## Error Handling & Validation
- Every `POST` endpoint validates required fields and returns `400 Bad Request` with a JSON error payload.
- Queries use **parameterised statements** to prevent SQL injection.
- All database calls are wrapped in `try/catch`; on failure the server returns a generic error and logs the exception.
- Admin‑only routes check the user's role (`admin`, `manager`, `analyst`, `viewer`).

## AI Pipeline (Run AI Analysis)
- Triggered via `POST /api/threats`.
- Runs **five sequential CrewAI agents**:
  1. **Threat Intelligence Agent** – enriches indicators via OSINT.
  2. **Vulnerability Assessment Agent** – maps CVEs to assets.
  3. **Risk Scoring Agent** – calculates criticality.
  4. **Incident Response Agent** – suggests containment steps.
  5. **Reporting Agent** – produces an executive summary.
- The pipeline uses **Groq** (`llama‑3.3‑70b‑versatile`). Frontend polls the job status using `GET /api/threats/job` until `status === "completed"`.

## Real‑time Updates
- The backend emits **Socket.io** events for any data change (see [WebSocket documentation](./WEBSOCKET.md)).

---

> For a full list of endpoints, see the **API Documentation** (`docs/API.md`).
