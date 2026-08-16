[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [Uri]$RegistryUrl,

    [Parameter(Mandatory = $true)]
    [Uri]$AllowInvocationUrl,

    [Parameter(Mandatory = $true)]
    [Uri]$DenyInvocationUrl,

    [Parameter(Mandatory = $true)]
    [Uri]$RevocationUrl,

    [Parameter(Mandatory = $true)]
    [Uri]$RevokedInvocationUrl,

    [Parameter(Mandatory = $true)]
    [Uri]$AuditQueryUrl,

    [Parameter(Mandatory = $true)]
    [Uri]$MetricsUrl,

    [Parameter(Mandatory = $true)]
    [string[]]$ApprovedEndpointHosts,

    [Parameter(Mandatory = $true)]
    [string]$TenantReference,

    [Parameter(Mandatory = $true)]
    [string]$ActorReference,

    [Parameter(Mandatory = $true)]
    [string]$ApprovalReference,

    [Parameter(Mandatory = $true)]
    [string]$TraceReference,

    [Parameter(Mandatory = $true)]
    [string]$EvidenceLocationReference,

    [Parameter(Mandatory = $true)]
    [string]$EvidenceDirectory,

    [ValidateSet("synthetic", "pilot", "production")]
    [string]$Environment = "synthetic",

    [Parameter(Mandatory = $true)]
    [int[]]$DeniedStatusCodes,

    [Parameter(Mandatory = $true)]
    [int[]]$RevokedStatusCodes,

    [switch]$AcknowledgeProductionInvocation
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-ApprovedUrl {
    param([Uri]$Url, [string]$Label, [string[]]$AllowedHosts)

    if ($Url.Scheme -ne "https" -or [string]::IsNullOrWhiteSpace($Url.Host)) {
        throw "$Label must be an approved HTTPS URL"
    }
    if (-not [string]::IsNullOrWhiteSpace($Url.UserInfo) -or -not [string]::IsNullOrWhiteSpace($Url.Query) -or -not [string]::IsNullOrWhiteSpace($Url.Fragment)) {
        throw "$Label must not contain user information, query values, or fragments"
    }
    if ($Url.Host.ToLowerInvariant() -notin $AllowedHosts) {
        throw "$Label host is not in ApprovedEndpointHosts"
    }
}

function Assert-Reference {
    param([string]$Value, [string]$Label)

    if ($Value -notmatch "^[a-z][a-z0-9+.-]*://[A-Za-z0-9._~:/-]+$" -or $Value.Length -gt 256) {
        throw "$Label must be a bounded opaque reference"
    }
}

function Invoke-ApprovedEndpoint {
    param([Uri]$Url, [string]$Scenario, [string]$Method)

    try {
        $response = Invoke-WebRequest -Uri $Url.AbsoluteUri -Method $Method -UseBasicParsing -ErrorAction Stop
        return [pscustomobject]@{ Scenario = $Scenario; StatusCode = [int]$response.StatusCode; Body = $response.Content }
    }
    catch {
        $response = $_.Exception.Response
        if ($null -eq $response) {
            throw "$Scenario endpoint could not be reached"
        }
        return [pscustomobject]@{ Scenario = $Scenario; StatusCode = [int]$response.StatusCode; Body = "" }
    }
}

function Assert-StatusCode {
    param([pscustomobject]$Response, [int[]]$Expected)

    if ($Response.StatusCode -notin $Expected) {
        throw "$($Response.Scenario) returned status $($Response.StatusCode)"
    }
}

function Get-ResponseReferences {
    param([pscustomobject]$Response)

    $references = [ordered]@{}
    if ([string]::IsNullOrWhiteSpace($Response.Body)) {
        return $references
    }
    try {
        $body = $Response.Body | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        throw "$($Response.Scenario) did not return a JSON reference response"
    }
    foreach ($name in @("trace_id", "invocation_id", "audit_event_id", "lifecycle_transition_ref", "execution_reference", "outcome_reference")) {
        $value = $body.$name
        if ($null -ne $value -and -not [string]::IsNullOrWhiteSpace([string]$value)) {
            $references[$name] = [string]$value
        }
    }
    if ($null -ne $body.evidence_refs) {
        $references["evidence_refs"] = @($body.evidence_refs | ForEach-Object { [string]$_ })
    }
    if ($null -ne $body.status) {
        $references["status"] = [string]$body.status
    }
    return $references
}

function Add-ScenarioEvidence {
    param([System.Collections.Generic.List[object]]$Evidence, [pscustomobject]$Response, [System.Collections.IDictionary]$References)

    $Evidence.Add([ordered]@{
            scenario = $Response.Scenario
            status_code = $Response.StatusCode
            references = $References
        })
}

function Get-SafeMetricEvidence {
    param([string]$Content)

    $safeMetrics = @(
        "moduregis_operations_total",
        "moduregis_operation_duration_seconds_sum",
        "moduregis_operation_duration_seconds_count",
        "moduregis_outbox_retries_total",
        "moduregis_outbox_pending_depth",
        "moduregis_outbox_oldest_pending_seconds"
    )
    $result = [System.Collections.Generic.List[object]]::new()
    foreach ($line in ($Content -split "`r?`n")) {
        if ($line -match "^(?<name>[a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{[^}]*\})?\s+(?<value>[0-9.eE+-]+)$" -and $safeMetrics -contains $matches.name) {
            $result.Add([ordered]@{ name = $matches.name; value = $matches.value })
        }
    }
    return $result
}

$normalizedApprovedEndpointHosts = @($ApprovedEndpointHosts | ForEach-Object { $_.ToLowerInvariant() })
foreach ($entry in @{
        RegistryUrl = $RegistryUrl
        AllowInvocationUrl = $AllowInvocationUrl
        DenyInvocationUrl = $DenyInvocationUrl
        RevocationUrl = $RevocationUrl
        RevokedInvocationUrl = $RevokedInvocationUrl
        AuditQueryUrl = $AuditQueryUrl
        MetricsUrl = $MetricsUrl
    }.GetEnumerator()) {
    Assert-ApprovedUrl $entry.Value $entry.Key $normalizedApprovedEndpointHosts
}
foreach ($entry in @{
        TenantReference = $TenantReference
        ActorReference = $ActorReference
        ApprovalReference = $ApprovalReference
        TraceReference = $TraceReference
        EvidenceLocationReference = $EvidenceLocationReference
    }.GetEnumerator()) {
    Assert-Reference $entry.Value $entry.Key
}
if ($Environment -eq "production" -and -not $AcknowledgeProductionInvocation) {
    throw "Production invocation requires -AcknowledgeProductionInvocation"
}
if ($Environment -eq "synthetic" -and $TenantReference -notmatch "^tenant://synthetic/") {
    throw "Synthetic environment requires a synthetic tenant reference"
}
if (-not (Test-Path -LiteralPath $EvidenceDirectory -PathType Container)) {
    throw "EvidenceDirectory must already exist and be access restricted"
}

$scenarioEvidence = [System.Collections.Generic.List[object]]::new()
$published = Invoke-ApprovedEndpoint $RegistryUrl "publish" "POST"
Assert-StatusCode $published @(200, 201)
Add-ScenarioEvidence $scenarioEvidence $published (Get-ResponseReferences $published)

$allowed = Invoke-ApprovedEndpoint $AllowInvocationUrl "allow" "POST"
Assert-StatusCode $allowed @(200, 202)
$allowedReferences = Get-ResponseReferences $allowed
if (-not $allowedReferences.Contains("invocation_id")) {
    throw "allow response is missing an invocation reference"
}
Add-ScenarioEvidence $scenarioEvidence $allowed $allowedReferences

$duplicate = Invoke-ApprovedEndpoint $AllowInvocationUrl "duplicate" "POST"
Assert-StatusCode $duplicate @(200, 202)
$duplicateReferences = Get-ResponseReferences $duplicate
if ($duplicateReferences["invocation_id"] -ne $allowedReferences["invocation_id"]) {
    throw "duplicate did not retain the allowed invocation reference"
}
Add-ScenarioEvidence $scenarioEvidence $duplicate $duplicateReferences

$denied = Invoke-ApprovedEndpoint $DenyInvocationUrl "deny" "POST"
Assert-StatusCode $denied $DeniedStatusCodes
$deniedReferences = Get-ResponseReferences $denied
if ($deniedReferences["status"] -ne "denied" -or $deniedReferences.Contains("execution_reference")) {
    throw "deny response does not prove blocked executor dispatch"
}
Add-ScenarioEvidence $scenarioEvidence $denied $deniedReferences

$revoked = Invoke-ApprovedEndpoint $RevocationUrl "revoke" "POST"
Assert-StatusCode $revoked @(200, 202)
Add-ScenarioEvidence $scenarioEvidence $revoked (Get-ResponseReferences $revoked)

$blocked = Invoke-ApprovedEndpoint $RevokedInvocationUrl "revoke-block" "POST"
Assert-StatusCode $blocked $RevokedStatusCodes
$blockedReferences = Get-ResponseReferences $blocked
if ($blockedReferences.Contains("execution_reference")) {
    throw "revoke-block response includes an executor reference"
}
Add-ScenarioEvidence $scenarioEvidence $blocked $blockedReferences

$audit = Invoke-ApprovedEndpoint $AuditQueryUrl "audit" "GET"
Assert-StatusCode $audit @(200)
$auditReferences = Get-ResponseReferences $audit
if ($auditReferences["trace_id"] -ne $TraceReference -or -not $auditReferences.Contains("audit_event_id")) {
    throw "audit response is not correlated to the approved trace reference"
}
Add-ScenarioEvidence $scenarioEvidence $audit $auditReferences

$metrics = Invoke-ApprovedEndpoint $MetricsUrl "SLO" "GET"
Assert-StatusCode $metrics @(200)
$metricEvidence = Get-SafeMetricEvidence $metrics.Body
if ($metricEvidence.Count -eq 0) {
    throw "SLO endpoint did not return approved metrics"
}

$manifest = [ordered]@{
    generated_at_utc = [DateTime]::UtcNow.ToString("o")
    tenant_reference = $TenantReference
    actor_reference = $ActorReference
    approval_reference = $ApprovalReference
    trace_reference = $TraceReference
    evidence_location_reference = $EvidenceLocationReference
    scenarios = $scenarioEvidence
    slo_metrics = $metricEvidence
}
$manifestPath = Join-Path $EvidenceDirectory "hr-pilot-acceptance-evidence.json"
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding utf8NoBOM
Write-Output $manifestPath
