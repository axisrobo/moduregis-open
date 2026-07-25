# ADR 0012: Commit Adapter Activation and Audit Event Atomically

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Calling a standalone audit store after an Adapter Registry transition permits inconsistent states: an adapter may become active even when its audit event cannot be persisted. That violates Moduregis control-plane transactional authority.

## Decision

- PostgreSQL Adapter Registry exposes `ActivateWithAudit` as the only Governor activation persistence boundary.
- One PostgreSQL transaction locks the verified adapter, transitions it to active, appends its transition history, and inserts the allowed Audit event.
- Audit event validation, tenant/namespace match, and allowed decision are required before commit.
- A failed audit insertion rolls back the Adapter transition and history write.
- Governor supplies actor, trace, policy version, evidence references, resource reference, and idempotent audit event ID.

## Consequences

- The public activation API can only be introduced through Governor plus this atomic store, never through a raw Registry transition endpoint.
- Audit event IDs provide transaction-level idempotency for retries.
- A future outbox can be appended in the same transaction for Harmovela delivery without making the event transport authoritative.
