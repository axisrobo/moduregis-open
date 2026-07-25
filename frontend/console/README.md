# Moduregis Console

The Console is the independent TypeScript/React management application for Moduregis.

## Development

```powershell
npm install
npm run dev
```

The development server proxies `/v1/health` to `http://localhost:8080`. Set `MODUREGIS_API_PROXY_TARGET` to change that target, or set `VITE_API_BASE_URL` for a deployed API boundary.

## Boundary

The Console consumes only versioned Moduregis HTTP APIs and generated public Contract types. It must not import Go backend packages, connect to PostgreSQL, or implement lifecycle and authorization decisions locally.

Current Phase 0 screen: control-plane health and the gated product surface. Capability Catalog, publishing, invocation, and administration appear only when their AEGIVELA-protected backend APIs exist.
