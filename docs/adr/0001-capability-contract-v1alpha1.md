# ADR 0001: Capability Contract v1alpha1

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Moduregis requires a portable, machine-validatable definition of an enterprise Capability. It must support discovery, authorization, invocation, composition, conformance, and audit without treating an executor implementation or a search index as the authority.

Harmovela already establishes Draft 2020-12, `schemas.axisrobo.com` identifiers, and dotted lower-case names with underscore-permitted segments. Harmovela envelopes intentionally allow extension fields for transport evolution, but a Registry record requires stronger validation.

## Decision

`contracts/capability/moduregis.capability.v1alpha1.schema.json` defines the first Capability Contract.

- The schema uses JSON Schema Draft 2020-12 and the ID `https://schemas.axisrobo.com/moduregis.capability.v1alpha1.schema.json`.
- Capability IDs use Harmovela's dotted naming pattern. Hyphens are invalid; `engineering.quality.code_review` is valid.
- All fixed contract objects use `additionalProperties: false`. Only predicate parameters are intentionally open data maps.
- Preconditions and postconditions are required arrays of predicate references. Empty arrays explicitly declare no condition; prose is not an executable condition contract.
- Effects are structured records with `action`, `resource`, `classification`, and `reversible` rather than policy-opaque strings.
- Idempotency and recovery use constrained objects; retry strategies require an explicit positive limit.
- Permissions declare the Capability's maximum envelope. AEGIVELA remains authoritative for actual authorization and may attenuate it for an invocation.
- Network and filesystem limits are explicit. Allowlisted hosts and scoped filesystem paths are mandatory when their modes require them.
- Owner, executor, and governance references are required. Registry lifecycle, digital signatures, attestation outcomes, publication state, and revocation remain authoritative Registry records, not mutable Contract fields.
- `schema` references are relative to the published capability artifact. Moduregis verifies them at publication and does not fetch remote schemas during invocation.

## Consequences

- Publishers must provide more structured metadata than a tool manifest, but Resolver, Governor, and Conformance Kit receive stable inputs.
- Existing tool definitions require adapters or migration manifests before publication.
- `open` network and `full` filesystem are declarable maximums, not grants. AEGIVELA policy may deny them.
- A future Contract version is required for incompatible field or semantic changes. New optional fields may be considered only after compatibility fixtures are added.

## Verification

`npm install` followed by `npm run test:contracts` validates the schema against the committed positive and negative fixtures.
