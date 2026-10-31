// Client fetchers for the results and share endpoints (contract in lib/assessment/types.ts).
// Owner: D.

import type { Attempt } from "@/lib/assessment/types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      cache: "no-store",
      credentials: "same-origin",
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Нет соединения с сервером. Проверьте сеть и попробуйте ещё раз.", 0);
  }
  const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) {
    throw new ApiError(body?.error ?? `Сервер ответил ошибкой ${res.status}`, res.status);
  }
  return body as T;
}

export const resultsApi = {
  attempt: (id: string) =>
    request<{ attempt: Attempt }>(`/api/attempts/${encodeURIComponent(id)}`).then((r) => r.attempt),
  shared: (token: string) =>
    request<{ attempt: Attempt }>(`/api/share/${encodeURIComponent(token)}`).then((r) => r.attempt),
  createShare: (id: string) =>
    request<{ token: string }>(`/api/attempts/${encodeURIComponent(id)}/share`, {
      method: "POST",
    }).then((r) => r.token),
  revokeShare: (id: string) =>
    request<{ ok: true }>(`/api/attempts/${encodeURIComponent(id)}/share`, { method: "DELETE" }),
};

export function shareUrl(token: string): string {
  return `${window.location.origin}/results/share/${encodeURIComponent(token)}`;
}
