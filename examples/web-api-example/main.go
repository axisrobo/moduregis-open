// Package main demonstrates the MODUREGIS Web/API integration.
// It starts a minimal HTTP server that lists published capabilities through the MODUREGIS API.
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/axisvela/moduregis-open/sdk/go/v3/pepsdk"
)

func main() {
	apiBaseURL := os.Getenv("MODUREGIS_API_URL")
	if apiBaseURL == "" {
		apiBaseURL = "http://localhost:8080"
	}
	client := pepsdk.NewClient(apiBaseURL, os.Getenv("MODUREGIS_API_TOKEN"))

	mux := http.NewServeMux()
	mux.HandleFunc("GET /capabilities", func(w http.ResponseWriter, r *http.Request) {
		capabilities, err := client.ListCapabilities(r.Context(), r.URL.Query().Get("namespace"))
		if err != nil {
			http.Error(w, err.Error(), http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"capabilities": capabilities})
	})

	mux.HandleFunc("POST /invoke", func(w http.ResponseWriter, r *http.Request) {
		var request struct {
			CapabilityID   string `json:"capability_id"`
			Version        string `json:"version"`
			Namespace      string `json:"namespace"`
			IdempotencyKey string `json:"idempotency_key"`
			Input          any    `json:"input"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		result, err := client.Invoke(r.Context(), request.CapabilityID, request.Version, request.Namespace, request.IdempotencyKey, request.Input)
		if err != nil {
			http.Error(w, err.Error(), http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	})

	log.Printf("Moduregis example API listening on :3000, proxying to %s", apiBaseURL)
	_ = http.ListenAndServe(":3000", mux)
}
