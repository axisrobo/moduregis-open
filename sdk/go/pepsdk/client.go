// Package pepsdk provides the MODUREGIS Go SDK for capability governance.
// It includes typed clients for Catalog, Registry, Resolver, Publication, and Invocation.
package pepsdk

// Version is the SDK semantic version.
const Version = "0.1.0"

// Client holds configuration for the MODUREGIS API.
type Client struct {
	BaseURL          string
	AuthorizationToken string
}

// NewClient creates a MODUREGIS API client.
func NewClient(baseURL, token string) *Client {
	return &Client{
		BaseURL:             baseURL,
		AuthorizationToken:  token,
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
