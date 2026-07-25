# ADR 0005: Use Canonical SHA-256 Capability Contract Digests

**Status:** Accepted  
**Date:** 2026-07-15

## Context

MODUREGIS persists both a Capability Contract body and a digest. Without a defined canonical representation, equivalent JSON documents with different whitespace or object-key order produce different digests, while an unchecked digest provides no integrity guarantee.

## Decision

- Contract bodies must be JSON objects.
- The Registry decodes JSON with number preservation, serializes it into deterministic compact JSON, and computes `sha256:<lowercase-hex>` over those bytes.
- Registration rejects a supplied digest that does not equal the canonical digest.
- The Registry persists and returns the canonical document, not the publisher's whitespace/layout variant.
- JSON Schema Draft 2020-12 validation remains a separate Contract conformance responsibility. Digest validation proves body integrity; it does not prove semantic conformance.

## Consequences

- Field order and insignificant whitespace do not alter a Capability Contract version digest.
- Signers and publisher tooling must digest the canonical representation or obtain the digest from a Moduregis Contract SDK.
- Existing pre-release records marked as legacy remain traceable but do not meet this publication integrity rule until republished as a new immutable version.
