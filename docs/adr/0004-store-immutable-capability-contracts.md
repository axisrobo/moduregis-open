# ADR 0004: Store Immutable Capability Contract Bodies

**Status:** Accepted  
**Date:** 2026-07-15

## Context

A digest alone proves integrity only when the original document is available elsewhere. Moduregis Registry must support Catalog rendering, version comparison, audit reconstruction, and conformance investigation without treating a publisher workspace or a memory projection as the authority.

## Decision

- Each `capability_versions` row stores both `contract_digest` and immutable `contract_body JSONB`.
- The Go domain accepts a non-empty digest and valid JSON object, then makes defensive copies in all snapshots.
- The shared JSON Schema fixture validator remains the normative Contract-shape validator; the Go domain does not duplicate Draft 2020-12 validation.
- PostgreSQL migration `0003_capability_contract_body.sql` backfills pre-release records with a legacy digest marker and adds a trigger that rejects changes to either Contract field.

## Consequences

- Registry reads can provide the authoritative immutable Contract for Catalog, audit, and future API responses.
- Legacy pre-release records remain traceable but are not treated as schema-conformant publication artifacts.
- Contract body growth must be monitored. Large artifacts and evidence remain in object storage, referenced by digest and URI rather than embedded in Registry rows.
