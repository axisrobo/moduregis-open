export type TokenProvider = () => Promise<string>;

import type { components } from "./moduregis.v1alpha1.components";

export type CapabilitySummary = components["schemas"]["CapabilitySummary"];
export type CatalogResponse = components["schemas"]["CapabilityList"];
export type InvocationRequest = components["schemas"]["InvocationRequest"];
export type InvocationResponse = components["schemas"]["InvocationResponse"];
export type CapabilityRegistrationRequest = components["schemas"]["CapabilityRegistrationRequest"];
export type PublicationRequest = components["schemas"]["PublicationRequest"];
export type CapabilityResponse = components["schemas"]["CapabilityResponse"];
export type LifecycleRequest = components["schemas"]["LifecycleRequest"];
export type VersionComparison = components["schemas"]["VersionComparison"];
export type AttestationReport = components["schemas"]["AttestationReport"];
export type ApprovalPosition = components["schemas"]["ApprovalPosition"];
export type PlanSummary = components["schemas"]["PlanSummary"];
export type PlanResponse = components["schemas"]["PlanResponse"];

type ApiClientOptions = {
  apiBaseUrl: string;
  getAccessToken: TokenProvider;
  fetcher?: typeof fetch;
};

export type ApiClient = ReturnType<typeof createApiClient>;

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function createApiClient({ apiBaseUrl, getAccessToken, fetcher = fetch }: ApiClientOptions) {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");

  async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const token = await getAccessToken();
    const response = await fetcher(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => undefined) as { message?: string } | undefined;
      throw new ApiError(response.status, error?.message ?? response.statusText);
    }

    return response.json() as Promise<T>;
  }

  return {
    getAccessToken,
    async get<T>(path: string, signal?: AbortSignal): Promise<T> {
      const token = await getAccessToken();
      const response = await fetcher(`${baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => undefined) as { message?: string } | undefined;
        throw new ApiError(response.status, body?.message ?? response.statusText);
      }

      return response.json() as Promise<T>;
    },

    async listCapabilities(namespace: string, signal?: AbortSignal): Promise<CatalogResponse> {
      return this.get<CatalogResponse>(`/v1/capabilities?namespace=${encodeURIComponent(namespace)}`, signal);
    },

    async getInvocation(invocationID: string, namespace: string, signal?: AbortSignal): Promise<InvocationResponse> {
      return this.get<InvocationResponse>(`/v1/invocations/${encodeURIComponent(invocationID)}?namespace=${encodeURIComponent(namespace)}`, signal);
    },

    async invoke(request: InvocationRequest, signal?: AbortSignal): Promise<InvocationResponse> {
      return post<InvocationResponse>("/v1/invocations", request, signal);
    },

    async registerCapability(namespace: string, contract: CapabilityRegistrationRequest["contract"], signal?: AbortSignal): Promise<CapabilityResponse> {
      return post<CapabilityResponse>("/v1/capabilities", { namespace, contract }, signal);
    },

    async publishCapability(id: string, version: string, namespace: string, request: PublicationRequest, signal?: AbortSignal): Promise<CapabilityResponse> {
      const path = `/v1/publications/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/publish?namespace=${encodeURIComponent(namespace)}`;
      return post<CapabilityResponse>(path, request, signal);
    },

    async transitionCapability(action: "suspend" | "deprecate" | "revoke" | "reactivate" | "retire", id: string, version: string, namespace: string, request: LifecycleRequest, signal?: AbortSignal): Promise<CapabilityResponse> {
      const path = `/v1/capabilities/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/${action}?namespace=${encodeURIComponent(namespace)}`;
      return post<CapabilityResponse>(path, request, signal);
    },

    async compareVersions(id: string, base: string, target: string, namespace: string, signal?: AbortSignal): Promise<VersionComparison> {
      const path = `/v1/capabilities/${encodeURIComponent(id)}/versions/${encodeURIComponent(base)}/compare/${encodeURIComponent(target)}?namespace=${encodeURIComponent(namespace)}`;
      return this.get<VersionComparison>(path, signal);
    },

    async listAttestations(id: string, version: string, namespace: string, signal?: AbortSignal): Promise<AttestationReport> {
      const path = `/v1/capabilities/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/attestations?namespace=${encodeURIComponent(namespace)}`;
      return this.get<AttestationReport>(path, signal);
    },

    async getApprovalPosition(id: string, version: string, namespace: string, signal?: AbortSignal): Promise<ApprovalPosition> {
      const path = `/v1/capabilities/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/approval-position?namespace=${encodeURIComponent(namespace)}`;
      return this.get<ApprovalPosition>(path, signal);
    },

    async registerPlan(namespace: string, contract: Record<string, unknown>, signal?: AbortSignal): Promise<PlanResponse> {
      return post<PlanResponse>("/v1/plans", { namespace, contract }, signal);
    },

    async listPlans(namespace: string, signal?: AbortSignal): Promise<{ plans: PlanSummary[] }> {
      return this.get<{ plans: PlanSummary[] }>(`/v1/plans?namespace=${encodeURIComponent(namespace)}`, signal);
    },

    async getPlan(id: string, version: string, namespace: string, signal?: AbortSignal): Promise<PlanResponse> {
      const path = `/v1/plans/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}?namespace=${encodeURIComponent(namespace)}`;
      return this.get<PlanResponse>(path, signal);
    },

    async publishPlan(id: string, version: string, namespace: string, request: LifecycleRequest, signal?: AbortSignal): Promise<PlanResponse> {
      const path = `/v1/plans/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/publish?namespace=${encodeURIComponent(namespace)}`;
      return post<PlanResponse>(path, request, signal);
    },

    async transitionPlan(action: "suspend" | "deprecate" | "revoke" | "reactivate" | "retire", id: string, version: string, namespace: string, request: LifecycleRequest, signal?: AbortSignal): Promise<PlanResponse> {
      const path = `/v1/plans/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/${action}?namespace=${encodeURIComponent(namespace)}`;
      return post<PlanResponse>(path, request, signal);
    },

    async listPlanAttestations(id: string, version: string, namespace: string, signal?: AbortSignal): Promise<AttestationReport> {
      const path = `/v1/plans/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/attestations?namespace=${encodeURIComponent(namespace)}`;
      return this.get<AttestationReport>(path, signal);
    },
  };
}
