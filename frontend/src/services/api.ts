const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");

if (!API_BASE) {
  throw new Error("VITE_API_BASE_URL não configurada");
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;

  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let details = "sem corpo";
    try {
      if (contentType.includes("application/json")) {
        const json = await response.json();
        details = json?.message || JSON.stringify(json);
      } else {
        details = (await response.text()) || "sem corpo";
      }
    } catch {
      details = "sem corpo";
    }

    throw new Error(`API ${response.status} em ${url} -> ${details}`);
  }

  if (response.status === 204) return null as T;

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}
