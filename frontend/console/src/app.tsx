import { useEffect, useState } from "react";
import { checkHealth, type HealthStatus } from "./api/health";

const surfaces = ["Catalog", "Publish", "Plans", "Operations", "Administration"];

function statusLabel(status: HealthStatus) {
  if (status === "available") return "API reachable";
  if (status === "unavailable") return "API unavailable";
  return "Checking API";
}

export function App() {
  const [health, setHealth] = useState<HealthStatus>("checking");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setHealth("checking");
    checkHealth(controller.signal).then(setHealth).catch(() => undefined);
    return () => controller.abort();
  }, [refresh]);

  return (
    <main className="shell">
      <header className="masthead">
        <a className="brand" href="#overview" aria-label="Moduregis control plane overview">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>Moduregis</span>
        </a>
        <p className="product-type">Enterprise Capability Control Plane</p>
        <span className={`health health-${health}`} role="status">{statusLabel(health)}</span>
      </header>

      <section className="hero" id="overview">
        <p className="eyebrow">Phase 0 / Contract Foundation</p>
        <h1>Govern the capability, not the runtime.</h1>
        <p className="hero-copy">
          Moduregis establishes the authoritative identity, lifecycle, and evidence trail for enterprise capabilities.
          Execution, authorization, memory, and workflow systems remain independently owned.
        </p>
        <button className="refresh" type="button" onClick={() => setRefresh((value) => value + 1)}>
          Refresh control-plane health
        </button>
      </section>

      <section className="surface-grid" aria-label="Product surfaces">
        {surfaces.map((surface) => (
          <article className="surface" key={surface}>
            <p className="surface-state">Gated</p>
            <h2>{surface}</h2>
            <p>Available after its protected backend API and AEGIVELA policy contract are introduced.</p>
          </article>
        ))}
      </section>

      <section className="boundary" aria-labelledby="boundary-title">
        <div>
          <p className="eyebrow">Authority boundary</p>
          <h2 id="boundary-title">What this Console can trust</h2>
        </div>
        <ul>
          <li>Published Moduregis API responses and immutable Contract versions.</li>
          <li>AEGIVELA decisions supplied by protected backend endpoints.</li>
          <li>Evidence references, never raw secrets or executor-local logs.</li>
        </ul>
      </section>
    </main>
  );
}
