# Moduregis Product Roadmap

## Outcome

Moduregis becomes the enterprise control plane for the complete Capability path:

```text
define -> verify -> publish -> discover -> authorize -> invoke -> revoke -> audit
```

Each phase is a deployable vertical slice. A later phase must not begin by replacing the authority or security decisions proven in an earlier phase.

## Phase 0: v0.1 Vertical Capability Foundation

**Objective:** prove one governed Capability from Skill Package import through authorized execution and auditable outcome.

- Publish the `Capability Contract v1alpha1` schema, fixtures, canonical digest, compatibility policy, and validator.
- Implement Registrar import, immutable Registry versions, Catalog, and a one-Intent Resolver.
- Integrate AEGIVELA authorization, Governor publication approval, and a PRAXOVELA/AXON Broker adapter.
- Emit Harmovela lifecycle correlation events and store audit/outcome references.
- Deliver Console views for Catalog, Contract draft/Gates, and the single invocation timeline.

**Exit criteria:** one Skill Package produces a validated Contract and executes through one authorized Capability implementation; a denied or revoked request does not reach AXON; all control-plane actions preserve tenant, actor, policy, trace, and evidence context.

## Phase 1: Governed Publication

**Objective:** make a verified Contract safely publishable, discoverable, and revocable.

- Add Catalog projections, structured search, filtering, and version comparison.
- Add Attestor references for Contract validation, artifact digests, executor identity, and conformance reports.
- Integrate AEGIVELA for publisher identity, publication policy decisions, and approval positions.
- Add Console publication workflow, approval inbox, lifecycle views, and Audit Index.
- Implement suspension, deprecation, and emergency revocation semantics.

**Exit criteria:** a user can trace a published Capability to an owner, policy decision, attestation evidence, immutable Contract version, and revocation history.

## Phase 2: Resolve, Authorize, Invoke

**Objective:** support governed single-Capability execution.

- Add Resolver eligibility filtering by Contract, tenant, namespace, policy, risk, placement, and input compatibility.
- Add Runtime Broker adapters for PRAXOVELA and LIMENORA.
- Exchange subject, scope, policy context, and invocation constraints with AEGIVELA.
- Add idempotency keys, execution status, cancellation, evidence references, and failure classification.
- Add MNEMOVELA projection for semantic retrieval and execution experience; structural eligibility remains in Moduregis.

**Exit criteria:** an authorized caller can invoke a CRM, HR, or Finance Capability; a denied, expired, or revoked request cannot reach an executor.

## Phase 3: Plan Governance and Process Materialization

**Objective:** govern multi-Capability plans without becoming a planner or workflow engine.

- Define Capability Plan Contract, plan versioning, approval positions, and replan boundaries.
- Integrate ORCHADYN through a Planning Service adapter.
- Validate Plan references against published Contract versions and current policy.
- Send approved long-running Plans to RHEOVELA for materialization and preserve plan/process linkage.
- Correlate Harmovela task and delegation references with Moduregis audit records.

**Exit criteria:** a Plan can be produced, governed, approved, materialized, paused for human approval, compensated, and audited end-to-end.

## Phase 4: Enterprise Operations

**Objective:** make the platform operable at enterprise scale.

- Add GitOps promotion, environment policy, release approvals, and signed publication bundles.
- Add tenant administration, quota management, retention configuration, backup/restore, and disaster recovery drills.
- Add OpenTelemetry-based SLO dashboards, exportable audit manifests, and security incident workflows.
- Publish SDKs, deployment charts, reference integrations, and third-party publisher certification.

**Exit criteria:** a production-adjacent pilot meets availability, revocation, audit-completeness, and tenant-isolation targets for an agreed period.

## Phase 5: Ecosystem and Advanced Governance

**Objective:** support a governed enterprise Capability ecosystem.

- Add federated Catalog exchange with explicit trust and attestation policies.
- Add policy simulation, change-impact analysis, and controlled migration for deprecated versions.
- Add advanced Enterprise Edition governance, organization hierarchy, regional operation, and compliance evidence packs.
- Expand supported Capability kinds only after their executor, conformance, and authorization contracts are stable.

## Priority Rules

1. Contract correctness, authorization, revocation, and auditability outrank semantic search and UI breadth.
2. A product integration is admitted only through a versioned adapter contract.
3. No feature may make a projection, cache, planner, workflow instance, or memory record authoritative for Capability lifecycle.
4. A phase Gate is evidence-based. A checklist item is not complete merely because an API or screen exists.
