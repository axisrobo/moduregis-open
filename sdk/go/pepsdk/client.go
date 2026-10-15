// Package pepsdk provides the MODUREGIS Go SDK for capability governance.
// It includes typed clients for Catalog, Registry, Resolver, Publication,
// Invocation, lifecycle transitions, attestation evidence, approval positions,
// version comparison, and CapabilityPlan governance.
package pepsdk

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Version is the SDK semantic version.
const Version = "0.2.0"

// ErrUnauthorized is returned when the API rejects the bearer artifact.
var ErrUnauthorized = errors.New("authorization failed")

// Client holds configuration for the MODUREGIS API.
type Client struct {
	BaseURL            string
	AuthorizationToken string
	HTTPClient         *http.Client
	// Tokens, when set, supplies the bearer credential per call (e.g. an
	// AEGIVELA workload assertion); it takes precedence over the static token.
	Tokens TokenSource
}

// NewClient creates a MODUREGIS API client.
func NewClient(baseURL, token string) *Client {
	return &Client{
		BaseURL:            baseURL,
		AuthorizationToken: token,
		HTTPClient:         &http.Client{Timeout: 15 * time.Second},
	}
}

// Capability represents a published capability version.
type Capability struct {
	ID             string `json:"id"`
	Version        string `json:"version"`
	State          string `json:"state"`
	ContractDigest string `json:"contract_digest"`
}

// Intent declares what a caller needs.
type Intent struct {
	Namespace      string   `json:"namespace"`
	CapabilityType string   `json:"capability_type,omitempty"`
	CapabilityID   string   `json:"capability_id,omitempty"`
	Verbs          []string `json:"verbs,omitempty"`
	Entities       []string `json:"entities,omitempty"`
}

// Candidate is one matching capability.
type Candidate struct {
	Capability  Capability `json:"capability"`
	Score       int        `json:"score"`
	Explanation string     `json:"explanation"`
}

// InvocationResult is the response from an invocation dispatch.
type InvocationResult struct {
	InvocationID       string   `json:"invocation_id"`
	Status             string   `json:"status"`
	ExecutionReference string   `json:"execution_reference,omitempty"`
	OutcomeReference   string   `json:"outcome_reference,omitempty"`
	EvidenceRefs       []string `json:"evidence_refs,omitempty"`
}

// LifecycleRequest carries trace and audit identity for a governed transition.
type LifecycleRequest struct {
	TraceID      string `json:"trace_id"`
	AuditEventID string `json:"audit_event_id"`
}

// CapabilityResponse is a governed capability operation result.
type CapabilityResponse struct {
	APIVersion string     `json:"api_version"`
	Capability Capability `json:"capability"`
}

// VersionComparison reports the diff between two Capability versions.
type VersionComparison struct {
	CapabilityID    string        `json:"capability_id"`
	BaseVersion     string        `json:"base_version"`
	TargetVersion   string        `json:"target_version"`
	BaseDigest      string        `json:"base_digest"`
	TargetDigest    string        `json:"target_digest"`
	VersionRelation string        `json:"version_relation"`
	DigestChanged   bool          `json:"digest_changed"`
	FieldChanges    []FieldChange `json:"field_changes,omitempty"`
}

// FieldChange is one top-level contract field difference.
type FieldChange struct {
	Field  string `json:"field"`
	Change string `json:"change"`
	From   any    `json:"from,omitempty"`
	To     any    `json:"to,omitempty"`
}

// Attestation is an immutable evidence reference.
type Attestation struct {
	AttestationID  string `json:"attestation_id"`
	Issuer         string `json:"issuer"`
	ArtifactDigest string `json:"artifact_digest"`
	EvidenceRef    string `json:"evidence_ref"`
	Status         string `json:"status"`
	OccurredAt     string `json:"occurred_at"`
}

// AttestationReport is the evidence for one subject version.
type AttestationReport struct {
	CapabilityID string        `json:"capability_id,omitempty"`
	PlanID       string        `json:"plan_id,omitempty"`
	Version      string        `json:"version"`
	Attestations []Attestation `json:"attestations"`
}

// ApprovalPosition reports where a publication stands.
type ApprovalPosition struct {
	CapabilityID        string `json:"capability_id,omitempty"`
	PlanID              string `json:"plan_id,omitempty"`
	Version             string `json:"version"`
	RiskLevel           string `json:"risk_level,omitempty"`
	PolicySetRef        string `json:"policy_set_ref,omitempty"`
	ApprovalMode        string `json:"approval_mode"`
	ApprovalRequired    bool   `json:"approval_required"`
	HasVerifiedEvidence bool   `json:"has_verified_evidence"`
	GateSatisfiable     bool   `json:"gate_satisfiable"`
	Status              string `json:"status"`
}

// PlanSummary is a governed plan version summary.
type PlanSummary struct {
	ID             string `json:"id"`
	Version        string `json:"version"`
	State          string `json:"state"`
	ContractDigest string `json:"contract_digest"`
}

// PlanResponse is a governed plan operation result.
type PlanResponse struct {
	APIVersion string      `json:"api_version"`
	Plan       PlanSummary `json:"plan"`
}

// doJSON performs an authenticated JSON request and decodes the response.
func (c *Client) doJSON(ctx context.Context, method, path string, body any, out any) error {
	var payload []byte
	var err error
	if body != nil {
		payload, err = json.Marshal(body)
		if err != nil {
			return fmt.Errorf("encode request: %w", err)
		}
	}
	req, err := http.NewRequestWithContext(ctx, method, c.BaseURL+path, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	token := c.AuthorizationToken
	if c.Tokens != nil {
		t, err := c.Tokens.Token(ctx)
		if err != nil {
			return fmt.Errorf("credential: %w", err)
		}
		token = t
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if resp.StatusCode == http.StatusUnauthorized {
		return ErrUnauthorized
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("MODUREGIS API returned status %d: %s", resp.StatusCode, string(data))
	}
	if out != nil && len(data) > 0 {
		if err := json.Unmarshal(data, out); err != nil {
			return fmt.Errorf("decode response: %w", err)
		}
	}
	return nil
}

// ListCapabilities lists published capability versions in a namespace.
func (c *Client) ListCapabilities(ctx context.Context, namespace string) ([]Capability, error) {
	var body struct {
		Capabilities []Capability `json:"capabilities"`
	}
	if err := c.doJSON(ctx, http.MethodGet, "/v1/capabilities?namespace="+namespace, nil, &body); err != nil {
		return nil, err
	}
	return body.Capabilities, nil
}

// Resolve matches an Intent to candidate capabilities.
func (c *Client) Resolve(ctx context.Context, intent Intent) ([]Candidate, error) {
	var body struct {
		Candidates []Candidate `json:"candidates"`
	}
	if err := c.doJSON(ctx, http.MethodPost, "/v1/resolve", intent, &body); err != nil {
		return nil, err
	}
	return body.Candidates, nil
}

// Invoke dispatches a governed capability invocation.
func (c *Client) Invoke(ctx context.Context, capabilityID, version, namespace, idempotencyKey string, input any) (InvocationResult, error) {
	request := map[string]any{
		"capability_id": capabilityID, "version": version, "namespace": namespace,
		"idempotency_key": idempotencyKey, "input": input,
	}
	var result InvocationResult
	if err := c.doJSON(ctx, http.MethodPost, "/v1/invocations", request, &result); err != nil {
		return InvocationResult{}, err
	}
	return result, nil
}

// TransitionCapability performs a governed lifecycle transition.
func (c *Client) TransitionCapability(ctx context.Context, action, id, version, namespace string, request LifecycleRequest) (Capability, error) {
	path := fmt.Sprintf("/v1/capabilities/%s/versions/%s/%s?namespace=%s", id, version, action, namespace)
	var response CapabilityResponse
	if err := c.doJSON(ctx, http.MethodPost, path, request, &response); err != nil {
		return Capability{}, err
	}
	return response.Capability, nil
}

// CompareVersions compares two Capability versions.
func (c *Client) CompareVersions(ctx context.Context, id, base, target, namespace string) (VersionComparison, error) {
	path := fmt.Sprintf("/v1/capabilities/%s/versions/%s/compare/%s?namespace=%s", id, base, target, namespace)
	var body struct {
		Comparison VersionComparison `json:"comparison"`
	}
	if err := c.doJSON(ctx, http.MethodGet, path, nil, &body); err != nil {
		return VersionComparison{}, err
	}
	return body.Comparison, nil
}

// ListAttestations returns attestation evidence for one Capability version.
func (c *Client) ListAttestations(ctx context.Context, id, version, namespace string) (AttestationReport, error) {
	path := fmt.Sprintf("/v1/capabilities/%s/versions/%s/attestations?namespace=%s", id, version, namespace)
	var report AttestationReport
	if err := c.doJSON(ctx, http.MethodGet, path, nil, &report); err != nil {
		return AttestationReport{}, err
	}
	return report, nil
}

// GetApprovalPosition returns the publication approval position for one version.
func (c *Client) GetApprovalPosition(ctx context.Context, id, version, namespace string) (ApprovalPosition, error) {
	path := fmt.Sprintf("/v1/capabilities/%s/versions/%s/approval-position?namespace=%s", id, version, namespace)
	var body struct {
		Position ApprovalPosition `json:"approval_position"`
	}
	if err := c.doJSON(ctx, http.MethodGet, path, nil, &body); err != nil {
		return ApprovalPosition{}, err
	}
	return body.Position, nil
}

// RegisterPlan registers an immutable CapabilityPlan draft.
func (c *Client) RegisterPlan(ctx context.Context, namespace string, contract json.RawMessage) (PlanSummary, error) {
	var response PlanResponse
	if err := c.doJSON(ctx, http.MethodPost, "/v1/plans", map[string]any{"namespace": namespace, "contract": contract}, &response); err != nil {
		return PlanSummary{}, err
	}
	return response.Plan, nil
}

// PublishPlan publishes a governed plan revision.
func (c *Client) PublishPlan(ctx context.Context, id, version, namespace string, request LifecycleRequest) (PlanSummary, error) {
	path := fmt.Sprintf("/v1/plans/%s/versions/%s/publish?namespace=%s", id, version, namespace)
	var response PlanResponse
	if err := c.doJSON(ctx, http.MethodPost, path, request, &response); err != nil {
		return PlanSummary{}, err
	}
	return response.Plan, nil
}

// TransitionPlan performs a governed plan lifecycle transition.
func (c *Client) TransitionPlan(ctx context.Context, action, id, version, namespace string, request LifecycleRequest) (PlanSummary, error) {
	path := fmt.Sprintf("/v1/plans/%s/versions/%s/%s?namespace=%s", id, version, action, namespace)
	var response PlanResponse
	if err := c.doJSON(ctx, http.MethodPost, path, request, &response); err != nil {
		return PlanSummary{}, err
	}
	return response.Plan, nil
}
