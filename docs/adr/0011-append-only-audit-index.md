# ADR 0011: Use an Append-Only Tenant-Scoped Audit Index

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Moduregis needs cross-system audit reconstruction for publication, activation, authorization, invocation, and revocation. Raw runtime logs belong to producing systems and may contain secrets or regulated data, but a control-plane index must preserve actor, trace, policy, decision, resource, and evidence references.

## Decision

- Audit Index records immutable events with tenant, namespace, event ID, actor, trace, action, resource reference, policy version, decision, evidence references, and occurrence time.
- PostgreSQL RLS isolates events by tenant; evidence references are stored as JSONB without copying raw evidence payloads.
- Audit events are append-only. Corrections are represented by new events rather than updates.
- Governor activation uses a shared PostgreSQL transaction that writes Adapter state, transition history, and allowed Audit event together. The standalone Audit Store remains for independent query/index use.

## Consequences

- Audit trace queries can connect Moduregis control-plane decisions to AEGIVELA and executor evidence systems.
- Event IDs provide idempotency keys for future transactional outbox delivery.
- The current internal Governor gate remains non-public until a production AEGIVELA activation adapter is configured.
