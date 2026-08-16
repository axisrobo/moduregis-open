import type { ApiClient } from "./client";

export type HealthStatus = "checking" | "available" | "unavailable";

export async function checkHealth(apiClient: ApiClient, signal: AbortSignal): Promise<HealthStatus> {
  try {
    const body = await apiClient.get<{ status?: string }>("/v1/health", signal);
    return body.status === "ok" ? "available" : "unavailable";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return "unavailable";
  }
}
