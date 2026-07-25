# ADR 0003: PostgreSQL Is the Authoritative Moduregis Store

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Moduregis needs transactional lifecycle changes, tenant isolation, immutable version identity, append-only transition history, and cross-module audit associations. The initial architecture is a modular monolith, so its control-plane authority must not be split across a cache, search index, event stream, or memory projection.

## Decision

- PostgreSQL 16 is the authoritative relational store for Moduregis control-plane state.
- Registry tables use tenant-first composite primary keys and append-only transition history.
- PostgreSQL Row-Level Security is enabled and forced for tenant-owned Registry tables.
- Every repository transaction sets `moduregis.tenant_id` with `SET LOCAL` semantics before accessing tenant data.
- Lifecycle validation happens in the Go domain and is persisted atomically with transition history in one PostgreSQL transaction.
- Object storage holds large immutable artifacts and raw evidence; PostgreSQL holds their content digests and references.
- Valkey, full-text search, MNEMOVELA projections, and event transport are non-authoritative and rebuildable.

## Consequences

- PostgreSQL availability and backup/recovery are part of Moduregis's primary operational SLO.
- Application roles must not own tables or bypass RLS. Migration and break-glass roles require separately controlled access.
- A PostgreSQL integration test environment is required before the adapter is considered production-ready.
- Future read replicas or partitioning may be introduced only without changing the Registry authority model.
