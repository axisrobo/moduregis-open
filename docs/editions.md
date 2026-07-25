# Moduregis OSS and Enterprise Edition Boundaries

## Principle

The OSS distribution must be a complete, secure single-organization Capability control plane. Enterprise Edition adds scale, organization-wide governance, compliance, and operations; it must not turn basic Contract validation, authorization integration, or security fixes into proprietary dependencies.

Licensing is a separate commercial and legal decision. This document defines functional boundaries only.

## Repository Boundaries

| Repository | Responsibility | Dependency direction |
|---|---|---|
| `https://github.com/axisrobo/moduregis` | OSS Core, public Contract assets, reference adapters, and shared security fixes | Must stand alone for a complete single-organization control plane |
| `https://github.com/axisrobo/moduregis-ee` | Enterprise-only modules, packaging, operations, and certified integrations | Depends on published OSS APIs, schemas, SDKs, and extension ports |

The repositories are siblings, not nested repositories or source-tree copies. `moduregis-ee` must pin compatible OSS Contract/API versions and may not import `moduregis` internal Go packages. Shared Contract changes, compatibility fixtures, and security fixes are made in `moduregis` first, then consumed by Enterprise Edition through a released version.

## OSS Core

| Capability | OSS scope |
|---|---|
| Contract | JSON Schema, compatibility fixtures, validator, generated types, SDK foundations |
| Registry | immutable versions, lifecycle, owner, tenant/namespace isolation, suspension and revocation APIs |
| Catalog and Resolver | structured Catalog, filtering, explainable eligibility, basic search |
| Governance | policy binding references, AEGIVELA adapter interface, basic publication Gate workflow, CAP-C0/C1 |
| Broker | standard invocation contract, idempotency, execution status, PRAXOVELA reference adapter; no embedded executor |
| Attestation | Contract/conformance evidence association and basic digest verification |
| Audit | append-only Audit Index, evidence references, trace correlation, export manifest |
| Operations | single-region deployment examples, health checks, metrics, backup guidance |
| Console | publishing, Catalog, basic administration, invocation and audit views |

## Enterprise Edition

| Capability | Enterprise addition |
|---|---|
| Organization | organization hierarchy, delegated administration, tenant provisioning automation, advanced quotas |
| Governance | approval matrices, segregation of duties, policy simulation, change-impact analysis, policy packs |
| Compliance | evidence packs, retention holds, compliance dashboards, SIEM/GRC connectors |
| Scale | multi-region control-plane operation, high-availability topology, read scaling, managed migration tooling |
| Operations | SLO dashboards, capacity controls, advanced incident workflows, enterprise support tooling |
| Integration | certified enterprise connectors, private Catalog federation, advanced GitOps promotion controls |
| Audit | long-term indexed retention, scheduled reports, privileged evidence-access governance |
| Console | organization operations center, portfolio analytics, executive reporting |

## Explicit Non-Boundaries

- AEGIVELA remains the authorization authority in both editions.
- Contract schemas and security-critical validation remain available in OSS.
- PRAXOVELA, RHEOVELA, LIMENORA, MNEMOVELA, ORCHADYN, and Harmovela keep their own product and licensing boundaries.
- Enterprise Edition does not create a second Registry or a proprietary Contract dialect.
- Enterprise Edition does not move tenant isolation, Contract validation, or the AEGIVELA integration port out of Core.
- Adapter Manifest schemas, open adapter ports, and baseline conformance fixtures remain Core; Enterprise may add certification workflow and certified connector support.

## Packaging Rules

1. Enterprise modules depend on published OSS ports, never private OSS internals.
2. OSS deployments must remain able to validate, publish, discover, authorize through AEGIVELA, invoke, revoke, and audit without Enterprise Edition.
3. Data exported from Enterprise Edition uses public Contract and audit formats where security permits.
4. A security remediation in a shared Contract, Registry, Broker, or adapter belongs in OSS unless it exclusively fixes Enterprise-only code.
5. Enterprise Edition uses published extension ports and release artifacts; it must not copy or modify OSS domain ownership rules.
