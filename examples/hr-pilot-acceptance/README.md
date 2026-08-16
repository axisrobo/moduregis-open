# HR Pilot Acceptance Example

A sanitized, externally runnable copy of the Moduregis HR pilot acceptance
script. It verifies the governed Capability path against a deployed control
plane using only its public HTTPS API:

- **publish** — a governed publication succeeds
- **allow** — an authorized invocation is accepted and idempotent
- **deny** — a policy denial never dispatches to an executor
- **revoke** — a post-transition invocation is blocked before executor contact
- **audit** — the approved trace reference correlates to durable audit records
- **SLO** — bounded metric values are captured

## Requirements

- A deployed Moduregis API with approved HTTPS URLs for the Registry, invocation,
  revocation, audit-query, and metrics endpoints.
- An approved endpoint-host allowlist and tenant/actor/approval/trace/evidence
  references.
- PowerShell 5.1 or 7. The script accepts no credentials, tokens, PII, or
  connection values and writes none.

## Run

```powershell
.\run-hr-pilot-acceptance.ps1 `
  -RegistryUrl "https://api.example.com/v1/..." `
  -AllowInvocationUrl "https://api.example.com/v1/..." `
  -DenyInvocationUrl "https://api.example.com/v1/..." `
  -RevocationUrl "https://api.example.com/v1/..." `
  -RevokedInvocationUrl "https://api.example.com/v1/..." `
  -AuditQueryUrl "https://api.example.com/v1/..." `
  -MetricsUrl "https://api.example.com/metrics" `
  -ApprovedEndpointHosts "api.example.com" `
  -TenantReference "tenant://synthetic/hr-pilot" `
  -ActorReference "actor://synthetic/operator" `
  -ApprovalReference "approval://synthetic/hr-pilot" `
  -TraceReference "trace://synthetic/hr-pilot" `
  -EvidenceLocationReference "evidence://synthetic/hr-pilot" `
  -EvidenceDirectory "C:\restricted\hr-pilot-evidence" `
  -Environment "synthetic" `
  -DeniedStatusCodes 202 `
  -RevokedStatusCodes 500
```

The script writes `hr-pilot-acceptance-evidence.json` into the restricted
evidence directory and prints its path.

## Authority

This is an example copy for external operators. The authoritative script and
runbook live in the Moduregis core repository under `scripts/` and
`docs/operations/`; the control plane remains the authority for publication,
authorization, revocation, and audit truth.
