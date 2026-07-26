# MODUREGIS Open

**MODUREGIS** is the AxisRobo Enterprise Capability Platform — the control plane for publishing, discovering, governing, authorizing, invoking, and auditing enterprise capabilities. This is the public-facing repository for the MODUREGIS Open Core (OSS) edition. It contains the project overview, integration guide, versioned contracts, documentation, SDK reference, and links to binary releases. The core implementation lives in a separate repository pending an open-source decision.

## What MODUREGIS Does

MODUREGIS provides a governed lifecycle for enterprise capabilities — declared, verified, transparent, and always traceable back to an owner, a policy decision, and a published contract.

### Open Core Capabilities

- **Capability Contract** — Versioned JSON Schema definition, positive/negative fixtures, and a compatibility policy for enterprise capability declarations.
- **HTTPExecutorAdapter v1alpha1** — Generic HTTPS executor Contract with route, TLS, timeout, and egress constraints. The first Beta uses this Contract instead of a PRAXOVELA-specific runtime adapter.
- **Contract Validation** — Versioned JSON Schemas and positive/negative fixtures serve as the conformance reference for any SDK or executor adapter.
- **Catalog API Contracts** — REST API surface for capability discovery and resolution, including intent matching and candidate explanation.
- **Governance Adapter Contracts** — Versioned, language-neutral contracts for integrating AEGIVELA (authorization), ORCHADYN (planning), PRAXOVELA (execution), RHEOVELA (workflow), MNEMOVELA (memory), and Harmovela (coordination).
- **Console** — TypeScript/React reference Console for capability Catalog, publication workflow, and audit views.
- **SDK** — Go SDK reference for consuming the MODUREGIS API.

## Architecture

```text
MODUREGIS Core
  Registry | Catalog | Resolver | Governor | Broker
  Attestor | Plan Registry | Audit Index
        |
  PostgreSQL | Object Store | Event Bus | Adapters
        |
  AEGIVELA | ORCHADYN | MNEMOVELA | PRAXOVELA/RHEOVELA | LIMENORA
identity/policy   planning   projection   execution          boundary
```

Moduregis owns Capability identity, version, lifecycle, owner, policy binding, and the cross-system audit index. It integrates AEGIVELA, ORCHADYN, PRAXOVELA, RHEOVELA, MNEMOVELA, LIMENORA, and Harmovela through stable, versioned adapter contracts. It does not implement agent reasoning, durable workflow state, enterprise ingress, memory retrieval, or authorization truth itself.

## OSS / Enterprise Boundary

| Layer | Open Core (OSS) | Enterprise Edition |
|---|---|---|
| Contract & Conformance | Schema, SDK, fixtures, linter | Certification service and support |
| Registry | Single/ basic multi-tenancy, version, lifecycle, Catalog | High-scale multi-tenancy, cross-region replication, retention governance |
| Governance | Basic policy binding, approval port | Organization policy bundles, approval matrix, compliance packs, risk analysis |
| Runtime Broker | Standard adapters, invocation contract, basic audit | HA orchestration, operational controls, SLA, advanced connectors |
| Console | Basic publish, search, invocation history | Operations dashboard, compliance reporting, organization management |

The open core must be sufficient to publish, validate, discover, and governedly invoke a capability. The enterprise edition adds enterprise infrastructure integration — SAML, SCIM, cross-region replication, compliance packs, and operational dashboards — without ever making core Capability contracts or security fixes a black-box dependency.

See [OSS/EE Boundary](docs/editions.md) for the full split.

## Quick Start

### Binary Download

Download the latest `moduregis-api` binary from GitHub Releases:

```powershell
# Windows (PowerShell)
Invoke-WebRequest -Uri "https://github.com/axisrobo/moduregis-open/releases/latest/download/moduregis-api.exe" -OutFile moduregis-api.exe
```

```bash
# Linux / macOS
curl -L -o moduregis-api https://github.com/axisrobo/moduregis-open/releases/latest/download/moduregis-api
chmod +x moduregis-api
```

### Runtime Configuration

The API requires PostgreSQL 16 and the following environment variables:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AEGIVELA_MODE` | yes | `stub` (development) or `remote` (production) |
| `AEGIVELA_BASE_URL` | remote | AEGIVELA API base URL |
| `AEGIVELA_INTERNAL_TOKEN` | remote | Internal service authentication |
| `LISTEN_ADDR` | no | Listen address (default `:8080`) |

See the [architecture overview](docs/architecture/overview.md) for the deployment topology and PostgreSQL setup.

### Console

The Console is a TypeScript/React reference UI for the MODUREGIS control plane. See [frontend/console](frontend/console/) for source and build instructions. It proxies to a running MODUREGIS API instance and does not connect directly to PostgreSQL.

## Integration Profiles

MODUREGIS is consumed through two integration profiles that share the same Capability Contract and lifecycle model.

| Profile | Consumer | Actions |
|---|---|---|
| **Capability Governance Console** | Platform operators, publishers, auditors | `capability:read`, `capability:publish`, `adapter:activate`, `capability:invoke` |
| **Capability Adapter Integration** | PRAXOVELA, ORCHADYN, RHEOVELA, MNEMOVELA, LIMENORA | Versioned adapter registration, activation, and execution dispatch |

## Repository Layout

```
moduregis-open/        ← You are here. Project homepage, docs, contracts, SDK, examples.
├── README.md
├── LICENSE            (Apache 2.0)
├── docs/              Architecture, roadmap, ADRs, product documentation
├── contracts/         Versioned JSON Schema contracts and fixtures
├── sdk/go/            Go SDK module
├── examples/          Integration and API usage examples
├── frontend/console/  Reference Console (TypeScript/React)
└── scripts/           Contract validation scripts
moduregis/             Core Go implementation (private, pending open-source decision)
moduregis-ee/          Enterprise extensions (private, Enterprise License)
```

## Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Module Boundaries](docs/architecture/modules.md)
- [Vertical MVP](docs/architecture/vertical-mvp.md)
- [Roadmap](docs/roadmap.md)
- [OSS/EE Boundary](docs/editions.md)
- [Development Guide](docs/operations/development.md)
- [Integration Contracts](docs/integrations/interop.md)
- [License](LICENSE)

## License

The MODUREGIS Open Core (`moduregis-open`) is licensed under the [Apache License 2.0](LICENSE).

| Repository | License |
|---|---|
| `moduregis-open` (this repo) | Apache 2.0 |
| `moduregis` (core implementation) | Pending |
| `moduregis-ee` (enterprise extensions) | Enterprise License |
