# ADR 0008: Use a Tenant-Scoped Adapter Registry

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Open adapter manifests need an authoritative lifecycle, immutable identity, tenant isolation, and revocation behavior. A plain configuration file or in-memory plugin list cannot prove which adapter version was eligible for an invocation or prevent cross-tenant activation.

## Decision

- Moduregis stores Adapter Manifests in a tenant/namespace-scoped Adapter Registry.
- Each adapter version persists canonical manifest JSONB and digest, with a database trigger preventing mutation.
- Lifecycle is `draft -> verified -> active`, with suspension and revocation paths.
- PostgreSQL RLS and tenant-first keys apply to adapter records and transition history.
- The Registry state machine is not authorization. Production transition to `active` requires Attestor evidence, AEGIVELA decision, and Governor orchestration; no public activation endpoint exists until those integrations are implemented.

## Consequences

- AxisRobo and third-party adapters obtain the same lifecycle and isolation guarantees.
- Manifest parsing and persistence do not grant invocation authority.
- Broker will resolve only `active` adapter versions once its governed execution path is implemented.
- Adapter activation audit records and attestation references are the next required additions before exposing activation APIs.
