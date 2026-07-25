# Moduregis Security and Tenancy Design

## Security Ownership

AEGIVELA is authoritative for identity, authorization, approval decisions, token attenuation, revocation, and attestation policy. Moduregis owns Capability governance and records the AEGIVELA decision/evidence references needed to explain a control-plane action.

Moduregis must never mint a long-lived executor credential, replace a policy decision with Catalog visibility, or continue dispatch after an authorization is revoked.

## Tenant Model

```text
tenant
  namespace
    capability identity
      immutable capability version
    plan
    invocation
```

- `tenant_id` is mandatory on every persistent aggregate, event, object-store prefix, cache key, and trace attribute.
- `namespace` is mandatory for Capability and Plan operations, and is a tenant-local governance boundary.
- `actor_id`, `subject_ref`, `trace_id`, `policy_version`, and `evidence_refs` accompany every control-plane command and audit event.
- Cross-tenant references are rejected by default. Federation is an explicit future feature with a trust contract.

## Data Isolation

| Layer | Required control |
|---|---|
| API | AEGIVELA-authenticated subject and tenant claim; reject caller-supplied tenant overrides |
| Application | transaction-scoped tenant context; all repository calls require it |
| Database | composite tenant-first keys, row-level security for service roles where supported, tenant-filtered foreign keys |
| Cache | tenant-prefixed keys, bounded TTL, no cache-as-authority behavior |
| Object storage | tenant/namespace prefix, short-lived signed access, digest verification |
| Search and analytics | tenant filtering before ranking; isolated indexes or mandatory filter injection |
| Telemetry | tenant-safe attributes; redact sensitive payloads and credentials |

## Authorization Flow

```text
caller identity
  -> Moduregis resolves Capability version and governance context
  -> AEGIVELA evaluates policy, scope, risk, approval, and revocation
  -> Moduregis Broker rechecks published/revoked state
  -> Broker sends short-lived, audience-bound authorization to executor
  -> executor returns outcome and evidence reference
```

The Broker validates the authorization audience, tenant, Capability version, scope, expiry, and invocation binding. It does not rely on an executor's claim that a caller was authorized.

## Publication Security

- Publishers may create drafts only in authorized namespaces.
- Publication requires Contract validation, owner validation, executor identity verification, conformance evidence, and policy decision.
- Published versions are immutable. A correction creates a new version; an emergency uses suspension or revocation.
- Artifact and evidence references include a content digest and retention class.
- A capability's requested permissions are a maximum declaration, not an automatic grant.

## Invocation Security

- Resolve results are filtered by tenant, namespace, lifecycle, input compatibility, placement, and policy visibility.
- Invocation uses an idempotency key and a short-lived, invocation-bound authorization artifact.
- Revocation is checked immediately before dispatch and during asynchronous continuation where applicable.
- High-risk calls require the declared evidence profile and any AEGIVELA approval outcome before executor contact.
- Raw secrets and user payloads do not enter the Audit Index; evidence records use references, digests, redacted summaries, and access controls.

## Threat-Driven Test Requirements

| Threat | Required proof |
|---|---|
| Tenant enumeration through Catalog | query and search isolation tests |
| Stale authorization after revocation | dispatch rejection and propagation-latency tests |
| Scope escalation | requested scope must be a subset of Contract envelope and policy grant |
| Artifact substitution | digest and executor-identity mismatch rejection |
| Confused deputy executor | audience- and invocation-bound authorization validation |
| Audit tampering | append-only event identity, integrity hash, and evidence-reference checks |
| Duplicate delivery | idempotent state transition and invocation dispatch tests |

## Retention and Privacy

Registry records follow lifecycle and legal retention policy. Audit Index retention is independently configurable by tenant policy. Evidence producers remain responsible for raw log retention and deletion; Moduregis retains only the minimum reference and integrity metadata necessary for traceability.
