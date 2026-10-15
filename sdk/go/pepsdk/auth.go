package pepsdk

import "context"

// TokenSource yields a bearer token for MODUREGIS calls (e.g. a short-lived
// AEGIVELA workload assertion). When set on a Client it takes precedence over
// the static AuthorizationToken, so the caller can present a fresh token.
type TokenSource interface {
	Token(ctx context.Context) (string, error)
}

type staticTokenSource string

func (s staticTokenSource) Token(context.Context) (string, error) { return string(s), nil }

// StaticTokenSource returns a TokenSource with a fixed token.
func StaticTokenSource(token string) TokenSource { return staticTokenSource(token) }
