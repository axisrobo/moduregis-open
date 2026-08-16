import { describe, expect, test, vi } from "vitest";
import { createApiClient } from "./client";

describe("API client", () => {
  test("forwards the asynchronously provided bearer token", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "ok" }), { status: 200 }));
    const client = createApiClient({
      apiBaseUrl: "https://api.example.test/",
      getAccessToken: async () => "issued-token",
      fetcher,
    });

    await expect(client.get<{ status: string }>("/v1/health")).resolves.toEqual({ status: "ok" });
    expect(fetcher).toHaveBeenCalledWith("https://api.example.test/v1/health", {
      headers: { Authorization: "Bearer issued-token" },
      signal: undefined,
    });
  });

  test("throws a typed API error for non-success responses", async () => {
    const client = createApiClient({
      apiBaseUrl: "https://api.example.test",
      getAccessToken: async () => "issued-token",
      fetcher: async () => new Response(JSON.stringify({ message: "forbidden" }), { status: 403, statusText: "Forbidden" }),
    });

    await expect(client.get("/v1/capabilities")).rejects.toMatchObject({
      name: "ApiError",
      status: 403,
      message: "forbidden",
    });
  });

  test("lists capabilities within the selected namespace", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      namespace: "engineering",
      capabilities: [{ id: "incident.create", version: "1.0.0", state: "published", contract_digest: "sha256:abc" }],
    }), { status: 200 }));
    const client = createApiClient({
      apiBaseUrl: "https://api.example.test",
      getAccessToken: async () => "issued-token",
      fetcher,
    });

    await expect(client.listCapabilities("engineering")).resolves.toMatchObject({
      namespace: "engineering",
      capabilities: [{ id: "incident.create", state: "published" }],
    });
    expect(fetcher).toHaveBeenCalledWith("https://api.example.test/v1/capabilities?namespace=engineering", {
      headers: { Authorization: "Bearer issued-token" },
      signal: undefined,
    });
  });

  test("submits an invocation through the governed API boundary", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      invocation_id: "inv-1",
      status: "reserved",
      evidence_refs: ["evidence://inv-1"],
    }), { status: 202 }));
    const client = createApiClient({
      apiBaseUrl: "https://api.example.test",
      getAccessToken: async () => "issued-token",
      fetcher,
    });

    await expect(client.invoke({
      capability_id: "incident.create",
      version: "1.0.0",
      namespace: "engineering",
      idempotency_key: "inv-1",
      input: { severity: "high" },
    })).resolves.toMatchObject({ invocation_id: "inv-1", status: "reserved" });
    expect(fetcher).toHaveBeenCalledWith("https://api.example.test/v1/invocations", {
      headers: {
        Authorization: "Bearer issued-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        capability_id: "incident.create",
        version: "1.0.0",
        namespace: "engineering",
        idempotency_key: "inv-1",
        input: { severity: "high" },
      }),
      signal: undefined,
      method: "POST",
    });
  });

  test("gets an invocation status within the selected namespace", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ invocation_id: "inv-1", status: "dispatched" }), { status: 200 }));
    const client = createApiClient({
      apiBaseUrl: "https://api.example.test",
      getAccessToken: async () => "issued-token",
      fetcher,
    });

    await expect(client.getInvocation("inv-1", "engineering")).resolves.toMatchObject({ status: "dispatched" });
    expect(fetcher).toHaveBeenCalledWith("https://api.example.test/v1/invocations/inv-1?namespace=engineering", {
      headers: { Authorization: "Bearer issued-token" },
      signal: undefined,
    });
  });

  test("submits registration and publication through the governed API boundary", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        api_version: "moduregis.io/v1alpha1",
        capability: { id: "incident.create", version: "1.0.0", state: "draft", contract_digest: "sha256:abc" },
      }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        api_version: "moduregis.io/v1alpha1",
        capability: { id: "incident.create", version: "1.0.0", state: "published", contract_digest: "sha256:abc" },
      }), { status: 200 }));
    const client = createApiClient({
      apiBaseUrl: "https://api.example.test",
      getAccessToken: async () => "issued-token",
      fetcher,
    });

    await expect(client.registerCapability("engineering", { id: "incident.create" })).resolves.toMatchObject({
      capability: { state: "draft" },
    });
    await expect(client.publishCapability("incident.create", "1.0.0", "engineering", {
      trace_id: "trace-1",
      audit_event_id: "publication-1",
    })).resolves.toMatchObject({ capability: { state: "published" } });

    expect(fetcher).toHaveBeenNthCalledWith(1, "https://api.example.test/v1/capabilities", {
      method: "POST",
      headers: { Authorization: "Bearer issued-token", "Content-Type": "application/json" },
      body: JSON.stringify({ namespace: "engineering", contract: { id: "incident.create" } }),
      signal: undefined,
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, "https://api.example.test/v1/publications/incident.create/versions/1.0.0/publish?namespace=engineering", {
      method: "POST",
      headers: { Authorization: "Bearer issued-token", "Content-Type": "application/json" },
      body: JSON.stringify({ trace_id: "trace-1", audit_event_id: "publication-1" }),
      signal: undefined,
    });
  });

  test("transitions a capability lifecycle state and reads governance evidence", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        api_version: "moduregis.io/v1alpha1",
        capability: { id: "incident.create", version: "1.0.0", state: "suspended", contract_digest: "sha256:abc" },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        api_version: "moduregis.io/v1alpha1",
        capability_id: "incident.create",
        version: "1.0.0",
        attestations: [{ attestation_id: "att-1", issuer: "attestor.example", artifact_digest: "sha256:abc", evidence_ref: "evidence://att-1", status: "verified", occurred_at: "2026-08-16T00:00:00Z" }],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        api_version: "moduregis.io/v1alpha1",
        capability_id: "incident.create",
        version: "1.0.0",
        approval_mode: "always_required",
        approval_required: true,
        has_verified_evidence: true,
        gate_satisfiable: true,
        status: "approved",
      }), { status: 200 }));
    const client = createApiClient({
      apiBaseUrl: "https://api.example.test",
      getAccessToken: async () => "issued-token",
      fetcher,
    });

    await expect(client.transitionCapability("suspend", "incident.create", "1.0.0", "engineering", {
      trace_id: "trace-s",
      audit_event_id: "audit-s",
    })).resolves.toMatchObject({ capability: { state: "suspended" } });
    await expect(client.listAttestations("incident.create", "1.0.0", "engineering")).resolves.toMatchObject({
      attestations: [{ attestation_id: "att-1" }],
    });
    await expect(client.getApprovalPosition("incident.create", "1.0.0", "engineering")).resolves.toMatchObject({
      status: "approved",
    });

    expect(fetcher).toHaveBeenNthCalledWith(1, "https://api.example.test/v1/capabilities/incident.create/versions/1.0.0/suspend?namespace=engineering", {
      method: "POST",
      headers: { Authorization: "Bearer issued-token", "Content-Type": "application/json" },
      body: JSON.stringify({ trace_id: "trace-s", audit_event_id: "audit-s" }),
      signal: undefined,
    });
  });

  test("registers and governs plans through the API boundary", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        api_version: "moduregis.io/v1alpha1",
        plan: { id: "engineering.quality.plan", version: "1.0.0", state: "draft", contract_digest: "sha256:abc" },
      }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        api_version: "moduregis.io/v1alpha1",
        plan: { id: "engineering.quality.plan", version: "1.0.0", state: "suspended", contract_digest: "sha256:abc" },
      }), { status: 200 }));
    const client = createApiClient({
      apiBaseUrl: "https://api.example.test",
      getAccessToken: async () => "issued-token",
      fetcher,
    });

    await expect(client.registerPlan("engineering", { id: "engineering.quality.plan" })).resolves.toMatchObject({
      plan: { state: "draft" },
    });
    await expect(client.transitionPlan("suspend", "engineering.quality.plan", "1.0.0", "engineering", {
      trace_id: "trace-ps",
      audit_event_id: "audit-ps",
    })).resolves.toMatchObject({ plan: { state: "suspended" } });

    expect(fetcher).toHaveBeenNthCalledWith(1, "https://api.example.test/v1/plans", {
      method: "POST",
      headers: { Authorization: "Bearer issued-token", "Content-Type": "application/json" },
      body: JSON.stringify({ namespace: "engineering", contract: { id: "engineering.quality.plan" } }),
      signal: undefined,
    });
  });
});
