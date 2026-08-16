# Support Boundaries

## Scope

This document defines the support and maintenance boundary for published
MODUREGIS Open Core releases and the matching `moduregis-open` artifacts
(contracts, API specification, Go SDK, and reference Console).

## Release and Support Model

MODUREGIS uses semantic versioning (`v<major>.<minor>.<patch>`). Published
versions are immutable: a tag and its published archives are never rewritten.

| Version | Support | Notes |
|---|---|---|
| Latest minor | Full support | Security and bug fixes land on the latest minor; new features require a minor bump. |
| Previous minor | Security fixes | Security fixes in shared Contract, Registry, Broker, or adapter behavior are backported when the fix does not depend on newer-only features. |
| Older minors | Best effort | Bug fixes are accepted as patches only when the maintainer can reproduce them on the current minor. |

## Contract and API Compatibility

- The `v1alpha1` Contract and OpenAPI surfaces are compared with a committed
  baseline before publication; a breaking change fails the gate without
  automatic approval.
- Breaking Contract or API changes require a new minor version and an ADR that
  records the lifecycle decision.
- API operations are deprecated only with a published successor in a newer API
  version.
- Additive, backward-compatible endpoints and schemas require a minor bump but
  do not require a major bump.

## Security Fixes

Security fixes in shared Contract, Registry, Broker, or adapter behavior belong
in the Open Core and are released on the latest minor first, then backported to
the previous minor when applicable. Emergency stops for a published Capability
use suspension or revocation; behavioral corrections require a new version.

## Supported Integrations

MODUREGIS integrates AEGIVELA, ORCHADYN, PRAXOVELA, RHEOVELA, MNEMOVELA,
LIMENORA, and Harmovela through versioned adapter contracts. An integration is
supported for the versions its published adapter contract declares; it is never
reached through MODUREGIS-internal packages.

## Support and Deprecation Timeline

- Patch releases are additive, backward-compatible fixes and non-behavioral
  changes; they do not change the public API surface.
- A feature or endpoint is removed only after its replacement is published and
  the documented sunset date passes.
- Consumers are notified of deprecation through the API deprecation headers and
  the published release notes.
