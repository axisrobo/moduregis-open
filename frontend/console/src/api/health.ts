export type HealthStatus = "checking" | "available" | "unavailable";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export async function checkHealth(signal: AbortSignal): Promise<HealthStatus> {
  try {
    const response = await fetch(`${apiBase}/v1/health`, { signal });
    if (!response.ok) {
      return "unavailable";
    }
    const body = (await response.json()) as { status?: string };
    return body.status === "ok" ? "available" : "unavailable";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return "unavailable";
  }
}
