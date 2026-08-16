import { FormEvent, useEffect, useState } from "react";
import { type ApiClient, type CapabilityResponse, type CapabilitySummary, type InvocationResponse } from "./api/client";
import { checkHealth, type HealthStatus } from "./api/health";
import { createInvocationAttempt } from "./invocation-attempt";
import { createPublicationAttempt } from "./publication-attempt";

function statusLabel(status: HealthStatus) {
  if (status === "available") return "API reachable";
  if (status === "unavailable") return "API unavailable";
  return "Checking API";
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : "The API request could not be completed.";
}

function invocationClass(status: string) {
  return `state state-${status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function isPublishedCapability(capability: CapabilitySummary | null): capability is CapabilitySummary {
  return capability?.state === "published";
}

function EvidenceRecords({ invocation }: { invocation: InvocationResponse | null }) {
  const references = invocation?.evidence_refs ?? [];
  return (
    <section className="evidence-panel" aria-labelledby="audit-title">
      <div>
        <p className="eyebrow">Audit evidence</p>
        <h2 id="audit-title">Record references</h2>
      </div>
      {references.length > 0 ? (
        <ul className="evidence-list">
          {references.map((reference) => <li key={reference}><code>{reference}</code></li>)}
        </ul>
      ) : (
        <p className="muted">Select or submit an invocation to inspect its immutable evidence references.</p>
      )}
    </section>
  );
}

export function App({ apiClient, configurationError }: { apiClient?: ApiClient; configurationError?: string }) {
  const [health, setHealth] = useState<HealthStatus>("checking");
  const [namespace, setNamespace] = useState("engineering");
  const [query, setQuery] = useState("");
  const [capabilities, setCapabilities] = useState<CapabilitySummary[]>([]);
  const [selectedCapability, setSelectedCapability] = useState<CapabilitySummary | null>(null);
  const [catalogState, setCatalogState] = useState<"idle" | "loading" | "error">("idle");
  const [catalogError, setCatalogError] = useState("");
  const [input, setInput] = useState('{\n  "request": ""\n}');
  const [invocationID, setInvocationID] = useState("");
  const [invocation, setInvocation] = useState<InvocationResponse | null>(null);
  const [invocationState, setInvocationState] = useState<"idle" | "loading" | "error">("idle");
  const [invocationError, setInvocationError] = useState("");
  const [invocationAttempt, setInvocationAttempt] = useState(() => createInvocationAttempt());
  const [capabilityDocument, setCapabilityDocument] = useState("{\n  \"kind\": \"Capability\"\n}");
  const [publicationTrace, setPublicationTrace] = useState("");
  const [publicationAttempt, setPublicationAttempt] = useState(() => createPublicationAttempt());
  const [registeredCapability, setRegisteredCapability] = useState<CapabilityResponse | null>(null);
  const [publicationResult, setPublicationResult] = useState<CapabilityResponse | null>(null);
  const [publicationState, setPublicationState] = useState<"idle" | "loading" | "error">("idle");
  const [publicationError, setPublicationError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    if (!apiClient) {
      setHealth("unavailable");
      return () => controller.abort();
    }
    checkHealth(apiClient, controller.signal).then(setHealth).catch(() => undefined);
    return () => controller.abort();
  }, [apiClient]);

  const filteredCapabilities = capabilities.filter((capability) => {
    const target = `${capability.id} ${capability.version} ${capability.state}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });
  const publication = publicationResult ?? registeredCapability;

  async function loadCatalog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiClient) return;
    setCatalogState("loading");
    setCatalogError("");
    try {
      const response = await apiClient.listCapabilities(namespace);
      setCapabilities(response.capabilities);
      setSelectedCapability((current) => response.capabilities.find((item) => item.id === current?.id && item.version === current.version) ?? null);
      setCatalogState("idle");
    } catch (error) {
      setCatalogError(readError(error));
      setCatalogState("error");
    }
  }

  async function loadInvocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiClient || !invocationID.trim()) return;
    setInvocationState("loading");
    setInvocationError("");
    try {
      setInvocation(await apiClient.getInvocation(invocationID.trim(), namespace));
      setInvocationState("idle");
    } catch (error) {
      setInvocationError(readError(error));
      setInvocationState("error");
    }
  }

  async function invokeCapability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiClient || !isPublishedCapability(selectedCapability)) return;
    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(input);
    } catch {
      setInvocationError("Input must be valid JSON.");
      setInvocationState("error");
      return;
    }

    setInvocationState("loading");
    setInvocationError("");
    try {
      const response = await apiClient.invoke({
        capability_id: selectedCapability.id,
        version: selectedCapability.version,
        namespace,
        idempotency_key: invocationAttempt.idempotencyKey,
        input: parsedInput,
      });
      setInvocation(response);
      setInvocationID(response.invocation_id);
      setInvocationState("idle");
    } catch (error) {
      setInvocationError(readError(error));
      setInvocationState("error");
    }
  }

  async function registerCapability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiClient) return;
    let contract: Record<string, unknown>;
    try {
      contract = JSON.parse(capabilityDocument) as Record<string, unknown>;
    } catch {
      setPublicationError("Capability document must be valid JSON.");
      setPublicationState("error");
      return;
    }

    setPublicationState("loading");
    setPublicationError("");
    setPublicationResult(null);
    setRegisteredCapability(null);
    try {
      setRegisteredCapability(await apiClient.registerCapability(namespace, contract));
      setPublicationState("idle");
    } catch (error) {
      setPublicationError(readError(error));
      setPublicationState("error");
    }
  }

  async function publishRegisteredCapability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiClient || !registeredCapability || !publicationTrace.trim()) return;
    setPublicationState("loading");
    setPublicationError("");
    try {
      const response = await apiClient.publishCapability(
        registeredCapability.capability.id,
        registeredCapability.capability.version,
        namespace,
        {
          trace_id: publicationTrace.trim(),
          audit_event_id: publicationAttempt.auditEventID,
        },
      );
      setPublicationResult(response);
      setRegisteredCapability(response);
      setPublicationState("idle");
    } catch (error) {
      setPublicationError(readError(error));
      setPublicationState("error");
    }
  }

  return (
    <main className="shell">
      <header className="masthead">
        <a className="brand" href="#catalog" aria-label="Moduregis Catalog">
          <span className="brand-mark" aria-hidden="true">M</span><span>Moduregis</span>
        </a>
        <p className="product-type">Enterprise Capability Control Plane</p>
        <span className={`health health-${health}`} role="status">{statusLabel(health)}</span>
      </header>

      <section className="console-intro" aria-labelledby="console-title">
        <p className="eyebrow">Console beta / governed path</p>
        <h1 id="console-title">Discover. Invoke. Evidence.</h1>
        <p>Catalog results and invocation status come from the Moduregis API. Access decisions remain with AEGIVELA.</p>
        {configurationError && <p className="form-error" role="alert">{configurationError}</p>}
      </section>

      <section className="workbench" id="catalog" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div><p className="eyebrow">Catalog</p><h2 id="catalog-title">Published capability versions</h2></div>
          <p>Search narrows API results; it does not grant access.</p>
        </div>
        <form className="catalog-controls" onSubmit={loadCatalog}>
          <label>Namespace<input value={namespace} onChange={(event) => setNamespace(event.target.value)} required /></label>
          <label className="search-field">Search loaded versions<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Capability ID or state" /></label>
          <button className="refresh" type="submit" disabled={!apiClient || catalogState === "loading"}>{catalogState === "loading" ? "Loading..." : "Load catalog"}</button>
        </form>
        {catalogState === "error" && <p className="form-error" role="alert">{catalogError}</p>}
        <div className="capability-list" aria-live="polite">
          {filteredCapabilities.map((capability) => (
            <button className={`capability ${selectedCapability?.id === capability.id && selectedCapability.version === capability.version ? "selected" : ""}`} key={`${capability.id}:${capability.version}`} type="button" onClick={() => setSelectedCapability(capability)}>
              <span><strong>{capability.id}</strong><small>{capability.version} / <code>{capability.contract_digest}</code></small></span><span className={invocationClass(capability.state)}>{capability.state}</span>
            </button>
          ))}
          {catalogState === "idle" && capabilities.length === 0 && <p className="empty-state">Load a namespace to view governed capability versions.</p>}
          {capabilities.length > 0 && filteredCapabilities.length === 0 && <p className="empty-state">No loaded versions match this search.</p>}
        </div>
      </section>

      <section className="publication-panel" aria-labelledby="publication-title">
        <div className="section-heading">
          <div><p className="eyebrow">Publication</p><h2 id="publication-title">Publish a capability</h2></div>
          <p>The Console submits documents and renders Registry results. Validation, policy, and lifecycle decisions remain server-owned.</p>
        </div>
        <div className="publication-grid">
          <form onSubmit={registerCapability}>
            <label>Capability document<textarea value={capabilityDocument} onChange={(event) => setCapabilityDocument(event.target.value)} spellCheck="false" required /></label>
            <button className="refresh" type="submit" disabled={!apiClient || publicationState === "loading"}>{publicationState === "loading" ? "Submitting..." : "Register draft"}</button>
          </form>
          <form onSubmit={publishRegisteredCapability}>
            <label>Trace ID<input value={publicationTrace} onChange={(event) => setPublicationTrace(event.target.value)} required /></label>
            <p className="muted">Publication retry key: <code>{publicationAttempt.auditEventID}</code></p>
            <div className="publication-actions">
              <button className="refresh" type="submit" disabled={!apiClient || !registeredCapability || !publicationTrace.trim() || publicationState === "loading"}>{publicationState === "loading" ? "Publishing..." : "Publish registered version"}</button>
              <button type="button" onClick={() => setPublicationAttempt(createPublicationAttempt())} disabled={publicationState === "loading"}>Reset retry key</button>
            </div>
          </form>
        </div>
        {publicationState === "error" && <p className="form-error" role="alert">{publicationError}</p>}
        {publication && <dl className="record-list publication-record" aria-live="polite"><div><dt>Lifecycle state</dt><dd><span className={invocationClass(publication.capability.state)}>{publication.capability.state}</span></dd></div><div><dt>Capability</dt><dd><code>{publication.capability.id}@{publication.capability.version}</code></dd></div><div><dt>Contract digest</dt><dd><code>{publication.capability.contract_digest}</code></dd></div></dl>}
      </section>

      <div className="operation-grid">
        <section className="invoke-panel" aria-labelledby="invoke-title">
          <p className="eyebrow">Invocation</p><h2 id="invoke-title">Invoke a published version</h2>
          <p className="muted">{selectedCapability ? `${selectedCapability.id} / ${selectedCapability.version}${isPublishedCapability(selectedCapability) ? "" : " is not published and cannot be invoked."}` : "Choose a capability version from the Catalog."}</p>
          <form onSubmit={invokeCapability}>
            <label>JSON input<textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck="false" required /></label>
            <p className="muted">Retry key: <code>{invocationAttempt.idempotencyKey}</code></p>
            <button className="refresh" type="submit" disabled={!apiClient || !isPublishedCapability(selectedCapability) || invocationState === "loading"}>{invocationState === "loading" ? "Submitting..." : "Request invocation"}</button>
            <button type="button" onClick={() => setInvocationAttempt(createInvocationAttempt())} disabled={invocationState === "loading"}>Start new invocation</button>
          </form>
        </section>

        <section className="status-panel" aria-labelledby="status-title">
          <p className="eyebrow">Status</p><h2 id="status-title">Invocation record</h2>
          <form className="lookup-form" onSubmit={loadInvocation}>
            <label>Invocation ID<input value={invocationID} onChange={(event) => setInvocationID(event.target.value)} placeholder="invocation ID" /></label>
            <button type="submit" disabled={!apiClient || !invocationID.trim() || invocationState === "loading"}>Look up</button>
          </form>
          {invocationState === "error" && <p className="form-error" role="alert">{invocationError}</p>}
          {invocation && <dl className="record-list"><div><dt>Status</dt><dd><span className={invocationClass(invocation.status)}>{invocation.status}</span></dd></div><div><dt>Invocation ID</dt><dd><code>{invocation.invocation_id}</code></dd></div>{invocation.execution_reference && <div><dt>Execution</dt><dd><code>{invocation.execution_reference}</code></dd></div>}{invocation.outcome_reference && <div><dt>Outcome</dt><dd><code>{invocation.outcome_reference}</code></dd></div>}</dl>}
          {!invocation && invocationState === "idle" && <p className="muted">Look up a record to see its current governed state.</p>}
        </section>
      </div>

      <EvidenceRecords invocation={invocation} />
    </main>
  );
}
