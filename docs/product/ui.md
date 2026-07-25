# Moduregis Console UX Design

## Product Principles

- Make authority visible: users can always see which Capability version, policy, approval, and evidence govern an action.
- Separate discovery from permission: Catalog visibility never implies an executable grant.
- Prefer progressive disclosure: publishers see the next missing publication Gate; auditors can expand the complete evidence chain.
- Do not present executor controls as Moduregis controls. Runtime-specific diagnostics link to the owning product.

## Personas

| Persona | Primary Console tasks |
|---|---|
| Publisher | create Contract draft, validate, submit, compare versions, respond to Gate failures |
| Namespace administrator | manage namespaces, owners, publication policy, deprecation, and revocation |
| Approver | inspect risk, requested permissions, effects, evidence, and approve or reject |
| Agent/application developer | search eligible Capability definitions, inspect Contract, obtain integration examples |
| Auditor | trace publication, policy, authorization, invocation, and external evidence |

## Information Architecture

```text
Home
Catalog
  Capability detail
  Version comparison
Publish
  Draft editor
  Validation and conformance
  Publication Gates
Plans
  Governed Plans
  Process materialization links
Operations
  Invocations
  Revocations
  Evidence explorer
Administration
  Tenants and namespaces
  Policy bindings
  Integrations
```

## Primary Flows

### Publish a Capability

1. Publisher selects tenant and namespace; Console verifies access.
2. Publisher uploads or edits a Contract manifest.
3. Inline validation shows schema, compatibility, executor, and governance failures separately.
4. Publisher views the requested permission envelope, effects, owner, policy set, and evidence requirement.
5. Publisher submits. The status becomes `submitted`; the Console shows each Gate and its responsible system.
6. After policy/approval and attestation complete, an authorized administrator publishes the immutable version.

### Resolve and Invoke

1. Developer supplies structured intent and inputs.
2. Console displays eligible candidates, exclusion reasons, Contract version, and whether authorization is still required.
3. User requests invocation; Console shows the AEGIVELA decision or approval step.
4. Invocation page shows dispatched executor, current status, trace ID, output reference, and evidence references.

### Revoke

1. Administrator selects a published version and chooses `suspend` or `revoke`.
2. Console requires reason, policy context, and confirmation appropriate to risk.
3. Console displays the effective state, revocation propagation status, impacted Plans/invocations, and audit event.

## Screen Requirements

| Screen | Required content |
|---|---|
| Capability list | tenant/namespace context, lifecycle, latest version, owner, risk, policy visibility-safe filters |
| Capability detail | immutable Contract, version lineage, attestation, policy binding, executor ref, dependencies, audit links |
| Contract editor | schema-aware form and YAML/JSON mode, no hidden defaults, validation linked to precise paths |
| Publication Gate view | each Gate state, evidence source, approver, failure reason, retry action |
| Invocation detail | Capability version, authorization state, executor, timeline, idempotency key, evidence references |
| Audit explorer | trace-centric timeline, integrity state, export manifest, links without raw secret payloads |
| Tenant administration | namespace policy, retention, integration status, quotas; no cross-tenant navigation |

## Accessibility and Safety

- Meet WCAG 2.2 AA for Console workflows.
- Use clear state labels and text, not color alone, for draft, published, suspended, revoked, denied, and pending approval.
- Destructive lifecycle actions require explicit typed confirmation and expose scope of impact.
- Permission and effect summaries must be human-readable and sourced directly from the immutable Contract.
- Audit and evidence pages redact secrets by default and record privileged evidence access.
