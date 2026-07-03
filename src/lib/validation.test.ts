import { describe, it, expect } from "vitest";
import {
    sanitizeString,
    threatIndicatorSchema,
    threatAssetSchema,
    threatsPostSchema,
    jobIdSchema,
    incidentPostSchema,
    incidentPatchSchema,
    playbookPostSchema,
    reportPostSchema,
    adminAssetPostSchema,
} from "./validation";

describe("sanitizeString", () => {
    it("escapes HTML-significant characters to mitigate XSS", () => {
        expect(sanitizeString(`<script>alert('xss')</script>`)).toBe(
            "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
        );
    });

    it("escapes ampersands and quotes", () => {
        expect(sanitizeString(`A & "B"`)).toBe("A &amp; &quot;B&quot;");
    });

    it("leaves plain text untouched", () => {
        expect(sanitizeString("CVE-2021-44228")).toBe("CVE-2021-44228");
    });
});

describe("threatIndicatorSchema", () => {
    it("accepts a valid indicator", () => {
        const result = threatIndicatorSchema.parse({
            type: "cve",
            value: "CVE-2021-44228",
            source: "NVD",
            confidence: 95,
        });
        expect(result.value).toBe("CVE-2021-44228");
    });

    it("rejects an invalid type enum value", () => {
        expect(() =>
            threatIndicatorSchema.parse({ type: "bogus", value: "x", source: "NVD" })
        ).toThrow();
    });

    it("rejects unknown fields (.strict())", () => {
        expect(() =>
            threatIndicatorSchema.parse({
                type: "ip", value: "1.2.3.4", source: "OTX", extraField: "should not be allowed",
            })
        ).toThrow();
    });

    it("rejects confidence outside 0-100", () => {
        expect(() =>
            threatIndicatorSchema.parse({ type: "ip", value: "1.2.3.4", source: "OTX", confidence: 150 })
        ).toThrow();
    });

    it("sanitizes HTML in the indicator value", () => {
        const result = threatIndicatorSchema.parse({
            type: "domain", value: "<img src=x onerror=alert(1)>", source: "OTX",
        });
        expect(result.value).not.toContain("<img");
    });

    it("rejects an empty value", () => {
        expect(() =>
            threatIndicatorSchema.parse({ type: "ip", value: "", source: "OTX" })
        ).toThrow();
    });
});

describe("threatAssetSchema", () => {
    it("accepts a minimal valid asset", () => {
        const result = threatAssetSchema.parse({
            id: "asset-1", name: "Web Server", criticality: "CRITICAL",
        });
        expect(result.criticality).toBe("CRITICAL");
    });

    it("rejects an invalid criticality value", () => {
        expect(() =>
            threatAssetSchema.parse({ id: "asset-1", name: "Web Server", criticality: "SUPER_HIGH" })
        ).toThrow();
    });

    it("validates nested software array entries", () => {
        expect(() =>
            threatAssetSchema.parse({
                id: "asset-1", name: "Web Server", criticality: "HIGH",
                software: [{ name: "Apache" }], // missing required `version`
            })
        ).toThrow();
    });
});

describe("threatsPostSchema", () => {
    it("requires at least one indicator and one asset", () => {
        expect(() => threatsPostSchema.parse({ indicators: [], assets: [] })).toThrow();
    });

    it("accepts a well-formed payload", () => {
        const result = threatsPostSchema.parse({
            indicators: [{ type: "cve", value: "CVE-2021-44228", source: "NVD" }],
            assets: [{ id: "a1", name: "Server", criticality: "CRITICAL" }],
        });
        expect(result.indicators).toHaveLength(1);
    });
});

describe("jobIdSchema", () => {
    it("accepts alphanumeric job ids with dashes/underscores", () => {
        expect(jobIdSchema.parse({ jobId: "cg-20260703-120000" }).jobId).toBe("cg-20260703-120000");
    });

    it("rejects job ids with path-traversal or injection characters", () => {
        expect(() => jobIdSchema.parse({ jobId: "../../etc/passwd" })).toThrow();
        expect(() => jobIdSchema.parse({ jobId: "cg-1'; DROP TABLE jobs;--" })).toThrow();
    });
});

describe("incidentPostSchema", () => {
    it("enforces minimum title/description lengths", () => {
        expect(() =>
            incidentPostSchema.parse({ title: "ab", description: "short desc here", severity: "high", assignee: "alice" })
        ).toThrow();
    });

    it("accepts a valid incident", () => {
        const result = incidentPostSchema.parse({
            title: "Ransomware detected", description: "Encrypted files found on host X",
            severity: "critical", assignee: "alice",
        });
        expect(result.severity).toBe("critical");
    });
});

describe("incidentPatchSchema", () => {
    it("requires at least one of assignee or status", () => {
        expect(() => incidentPatchSchema.parse({})).toThrow();
    });

    it("accepts a status-only update", () => {
        const result = incidentPatchSchema.parse({ status: "resolved" });
        expect(result.status).toBe("resolved");
    });

    it("rejects an invalid status value", () => {
        expect(() => incidentPatchSchema.parse({ status: "bogus-status" })).toThrow();
    });
});

describe("playbookPostSchema", () => {
    it("coerces a numeric-string steps value", () => {
        const result = playbookPostSchema.parse({
            title: "Contain Ransomware", description: "Isolate infected hosts immediately",
            category: "Ransomware", steps: "5",
        });
        expect(result.steps).toBe(5);
    });

    it("rejects steps out of 0-100 range", () => {
        expect(() =>
            playbookPostSchema.parse({
                title: "Contain Ransomware", description: "Isolate infected hosts immediately",
                category: "Ransomware", steps: 500,
            })
        ).toThrow();
    });
});

describe("reportPostSchema", () => {
    it("accepts a report without the optional description", () => {
        const result = reportPostSchema.parse({ title: "Q2 Security Report", type: "compliance" });
        expect(result.description).toBeUndefined();
    });
});

describe("adminAssetPostSchema", () => {
    it("rejects an unrecognized network_exposure value", () => {
        expect(() =>
            adminAssetPostSchema.parse({
                name: "DB Server", type: "database", criticality: "HIGH", network_exposure: "cloud",
            })
        ).toThrow();
    });
});
