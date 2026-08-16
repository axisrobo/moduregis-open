# HR Pilot Acceptance Runbook

Use `scripts/run-hr-pilot-acceptance.ps1` only for a synthetic or approved pilot environment. The package verifies the governed HR path; it does not
implement HR business logic, authorize an operation, or replace Registry,
AEGIVELA, or audit authority.

## Preconditions

1. Obtain approved HTTPS URLs for the Registry API, revocation operation, audit
   query, and metrics endpoint. Provide their approved endpoint-host allowlist
   and approval reference. The endpoints must be operated by approved services;
   URLs with user information or query values are not accepted.
2. Provide an approved tenant reference, actor reference, and evidence location
   reference. These are opaque references, not tenant names, employee records,
   identities, credentials, or evidence content.
3. Run from an already approved, authenticated operator environment. The script
   accepts no credential, grant, token, request input, PII, or connection value
   and does not write any of them.
4. Use a synthetic capability and synthetic request fixture. If a non-synthetic
   target is unavoidable, the operator must provide
   `-AcknowledgeProductionInvocation` and the approved change reference.

## Procedure

1. Set the approved endpoint and reference parameters and a restricted local
   output directory. Do not put secret values in PowerShell history, command
   arguments, or the evidence directory.
2. Run the script. It records only request status, trace and immutable result
   references returned by the approved services, and bounded metric values.
3. Verify the recorded scenario outcomes: publish succeeds; an authorized allow
   invocation is accepted; a policy deny has no executor dispatch; the duplicate
   request keeps its idempotent result; revoke blocks the post-transition
   invocation before executor contact; audit correlation contains the supplied
   trace and immutable references; and SLO metrics are collected.
4. Review `hr-pilot-acceptance-evidence.json` in the restricted output
   directory. Store only its evidence location reference in the pilot record.

## Failure Handling

Stop on a failed assertion. Record the scenario name, bounded status, trace ID,
immutable lifecycle, invocation, audit, or metric reference, and the evidence
location reference. Use the matching section of
`pilot-slo-runbooks.md`; do not retry by bypassing AEGIVELA, changing an
immutable published Capability, or invoking an unapproved executor route.
