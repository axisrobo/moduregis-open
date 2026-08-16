package pepsdk

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func newTestServer(t *testing.T) (*httptest.Server, *[]string) {
	t.Helper()
	var requests []string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-token" {
			t.Errorf("missing bearer token")
		}
		requests = append(requests, r.Method+" "+r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/v1/capabilities":
			_, _ = w.Write([]byte(`{"capabilities":[{"id":"hr.create_employee","version":"1.0.0","state":"published","contract_digest":"sha256:abc"}]}`))
		case "/v1/resolve":
			_, _ = w.Write([]byte(`{"candidates":[{"capability":{"id":"hr.create_employee","version":"1.0.0","state":"published","contract_digest":"sha256:abc"},"score":1,"explanation":"match"}]}`))
		case "/v1/invocations":
			_, _ = w.Write([]byte(`{"invocation_id":"inv-1","status":"dispatched","evidence_refs":["evidence://1"]}`))
		case "/v1/capabilities/hr.create_employee/versions/1.0.0/suspend":
			_, _ = w.Write([]byte(`{"api_version":"moduregis.io/v1alpha1","capability":{"id":"hr.create_employee","version":"1.0.0","state":"suspended","contract_digest":"sha256:abc"}}`))
		case "/v1/capabilities/hr.create_employee/versions/1.0.0/compare/1.1.0":
			_, _ = w.Write([]byte(`{"api_version":"moduregis.io/v1alpha1","comparison":{"capability_id":"hr.create_employee","base_version":"1.0.0","target_version":"1.1.0","version_relation":"newer","digest_changed":true}}`))
		case "/v1/capabilities/hr.create_employee/versions/1.0.0/attestations":
			_, _ = w.Write([]byte(`{"api_version":"moduregis.io/v1alpha1","capability_id":"hr.create_employee","version":"1.0.0","attestations":[{"attestation_id":"att-1","issuer":"attestor.example","status":"verified"}]}`))
		case "/v1/capabilities/hr.create_employee/versions/1.0.0/approval-position":
			_, _ = w.Write([]byte(`{"api_version":"moduregis.io/v1alpha1","approval_position":{"capability_id":"hr.create_employee","version":"1.0.0","approval_mode":"always_required","approval_required":true,"has_verified_evidence":true,"gate_satisfiable":true,"status":"approved"}}`))
		case "/v1/plans":
			_, _ = w.Write([]byte(`{"api_version":"moduregis.io/v1alpha1","plan":{"id":"engineering.quality.plan","version":"1.0.0","state":"draft","contract_digest":"sha256:plan"}}`))
		case "/v1/plans/engineering.quality.plan/versions/1.0.0/suspend":
			_, _ = w.Write([]byte(`{"api_version":"moduregis.io/v1alpha1","plan":{"id":"engineering.quality.plan","version":"1.0.0","state":"suspended","contract_digest":"sha256:plan"}}`))
		case "/v1/plans/engineering.quality.plan/versions/1.0.0/publish":
			_, _ = w.Write([]byte(`{"api_version":"moduregis.io/v1alpha1","plan":{"id":"engineering.quality.plan","version":"1.0.0","state":"published","contract_digest":"sha256:plan"}}`))
		default:
			t.Errorf("unexpected path %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)
	return server, &requests
}

func TestClientListCapabilities(t *testing.T) {
	server, _ := newTestServer(t)
	client := NewClient(server.URL, "test-token")
	capabilities, err := client.ListCapabilities(context.Background(), "hr")
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(capabilities) != 1 || capabilities[0].ID != "hr.create_employee" || capabilities[0].State != "published" {
		t.Fatalf("capabilities = %#v", capabilities)
	}
}

func TestClientInvoke(t *testing.T) {
	server, _ := newTestServer(t)
	client := NewClient(server.URL, "test-token")
	result, err := client.Invoke(context.Background(), "hr.create_employee", "1.0.0", "hr", "inv-1", map[string]any{"employee_reference": "emp-1"})
	if err != nil {
		t.Fatalf("invoke: %v", err)
	}
	if result.InvocationID != "inv-1" || result.Status != "dispatched" {
		t.Fatalf("result = %#v", result)
	}
}

func TestClientTransitionCapability(t *testing.T) {
	server, _ := newTestServer(t)
	client := NewClient(server.URL, "test-token")
	capability, err := client.TransitionCapability(context.Background(), "suspend", "hr.create_employee", "1.0.0", "hr", LifecycleRequest{TraceID: "t", AuditEventID: "e"})
	if err != nil {
		t.Fatalf("transition: %v", err)
	}
	if capability.State != "suspended" {
		t.Fatalf("state = %s, want suspended", capability.State)
	}
}

func TestClientCompareVersions(t *testing.T) {
	server, _ := newTestServer(t)
	client := NewClient(server.URL, "test-token")
	comparison, err := client.CompareVersions(context.Background(), "hr.create_employee", "1.0.0", "1.1.0", "hr")
	if err != nil {
		t.Fatalf("compare: %v", err)
	}
	if comparison.VersionRelation != "newer" || !comparison.DigestChanged {
		t.Fatalf("comparison = %#v", comparison)
	}
}

func TestClientListAttestations(t *testing.T) {
	server, _ := newTestServer(t)
	client := NewClient(server.URL, "test-token")
	report, err := client.ListAttestations(context.Background(), "hr.create_employee", "1.0.0", "hr")
	if err != nil {
		t.Fatalf("attestations: %v", err)
	}
	if len(report.Attestations) != 1 || report.Attestations[0].AttestationID != "att-1" {
		t.Fatalf("report = %#v", report)
	}
}

func TestClientGetApprovalPosition(t *testing.T) {
	server, _ := newTestServer(t)
	client := NewClient(server.URL, "test-token")
	position, err := client.GetApprovalPosition(context.Background(), "hr.create_employee", "1.0.0", "hr")
	if err != nil {
		t.Fatalf("position: %v", err)
	}
	if position.Status != "approved" || !position.GateSatisfiable {
		t.Fatalf("position = %#v", position)
	}
}

func TestClientRegisterAndTransitionPlan(t *testing.T) {
	server, requests := newTestServer(t)
	client := NewClient(server.URL, "test-token")
	contract := json.RawMessage(`{"kind":"CapabilityPlan","id":"engineering.quality.plan"}`)
	plan, err := client.RegisterPlan(context.Background(), "hr", contract)
	if err != nil {
		t.Fatalf("register plan: %v", err)
	}
	if plan.State != "draft" {
		t.Fatalf("plan state = %s, want draft", plan.State)
	}
	plan, err = client.TransitionPlan(context.Background(), "suspend", "engineering.quality.plan", "1.0.0", "hr", LifecycleRequest{TraceID: "t", AuditEventID: "e"})
	if err != nil {
		t.Fatalf("transition plan: %v", err)
	}
	if plan.State != "suspended" {
		t.Fatalf("plan state = %s, want suspended", plan.State)
	}
	plan, err = client.PublishPlan(context.Background(), "engineering.quality.plan", "1.0.0", "hr", LifecycleRequest{TraceID: "t", AuditEventID: "e"})
	if err != nil {
		t.Fatalf("publish plan: %v", err)
	}
	if plan.State != "published" {
		t.Fatalf("plan state = %s, want published", plan.State)
	}
	if len(*requests) != 3 {
		t.Fatalf("requests = %v", *requests)
	}
}

func TestClientRejectsUnauthorized(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	}))
	defer server.Close()
	client := NewClient(server.URL, "bad-token")
	if _, err := client.ListCapabilities(context.Background(), "hr"); err != ErrUnauthorized {
		t.Fatalf("err = %v, want ErrUnauthorized", err)
	}
}
