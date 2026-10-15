package pepsdk

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTokenSourceAuth(t *testing.T) {
	var gotAuth string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"capabilities":[]}`))
	}))
	defer srv.Close()

	c := NewClient(srv.URL, "")
	c.Tokens = StaticTokenSource("assert-jwt")
	if _, err := c.ListCapabilities(context.Background(), "hr"); err != nil {
		t.Fatalf("ListCapabilities: %v", err)
	}
	if gotAuth != "Bearer assert-jwt" {
		t.Fatalf("auth = %q, want Bearer assert-jwt", gotAuth)
	}
}

func TestStaticTokenFallback(t *testing.T) {
	var gotAuth string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"capabilities":[]}`))
	}))
	defer srv.Close()

	c := NewClient(srv.URL, "static-key")
	_, _ = c.ListCapabilities(context.Background(), "hr")
	if gotAuth != "Bearer static-key" {
		t.Fatalf("auth = %q, want Bearer static-key", gotAuth)
	}
}
