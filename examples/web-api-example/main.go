// Package main demonstrates the MODUREGIS Web/API integration.
// It starts a minimal HTTP server that lists published capabilities through the MODUREGIS API.
package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	// Replace with the real SDK import when published:
	// "github.com/axisrobo/moduregis-open/sdk/go/pepsdk"
)

func main() {
	apiBaseURL := os.Getenv("MODUREGIS_API_URL")
	if apiBaseURL == "" {
		apiBaseURL = "http://localhost:8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /capabilities", func(w http.ResponseWriter, r *http.Request) {
		backend := apiBaseURL + "/v1/capabilities?namespace=hr"
		req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, backend, nil)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		req.Header.Set("Authorization", r.Header.Get("Authorization"))
		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusServiceUnavailable)
			return
		}
		defer resp.Body.Close()
		var body any
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(body)
	})

	log.Printf("Moduregis example API listening on :3000, proxying to %s", apiBaseURL)
	_ = http.ListenAndServe(":3000", mux)
}
