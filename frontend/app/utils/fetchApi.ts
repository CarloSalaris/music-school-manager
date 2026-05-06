/**
 * fetchApi — Centralized HTTP client for REST API communication.
 *
 * Architecture decision: uses native fetch() instead of Nuxt's $fetch (ofetch).
 * Reason: ofetch swallows the response body on HTTP errors, making it impossible
 * to extract structured error messages from the API. Native fetch gives full
 * control over response handling in all cases.
 *
 * Features:
 * - Auth header injection (Bearer token from AuthStore)
 * - File download handling (Content-Disposition: attachment)
 * - Multipart upload support (FormData)
 * - Automatic JSON parsing with structured error extraction
 * - 401 → auto-logout
 * - API versioning header
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FetchApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
  withUpload?: boolean;
}

interface FetchApiErrorResponse {
  error: string;
  status: string;
  [key: string]: unknown;
}

interface FetchApiInstance {
  get: <T = unknown>(
    url: string,
    options?: FetchApiRequestOptions,
  ) => Promise<T>;
  post: <T = unknown>(
    url: string,
    body?: unknown,
    options?: FetchApiRequestOptions,
  ) => Promise<T>;
  delete: <T = unknown>(
    url: string,
    body?: unknown,
    options?: FetchApiRequestOptions,
  ) => Promise<T>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAuthHeader(): Record<string, string> {
  const { token } = useAuthStore();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function buildQueryString(params?: FetchApiRequestOptions["params"]): string {
  if (!params) return "";
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      filtered[key] = String(value);
    }
  }
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// Response handler
// ---------------------------------------------------------------------------

async function handleResponse<T>(response: Response): Promise<T> {
  // --- File download (Content-Disposition: attachment) ---
  const contentDisposition = response.headers.get("Content-Disposition");
  if (contentDisposition?.startsWith("attachment")) {
    const blob = await response.blob();
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download =
      contentDisposition.split(";")[1]?.split("=")[1]?.replace(/"/g, "") ??
      "download";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    return undefined as T;
  }

  // --- Non-JSON responses ---
  const contentType = response.headers.get("Content-Type");
  if (!contentType?.includes("application/json")) {
    const text = await response.text();
    if (!response.ok) {
      return Promise.reject({
        error: text,
        status: response.statusText,
      } satisfies FetchApiErrorResponse);
    }
    return text as T;
  }

  // --- JSON responses ---
  const raw = await response.text();
  const parsed = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    const error: FetchApiErrorResponse = {
      error: parsed?.data?.error ?? parsed?.error ?? "Unknown error",
      status: response.statusText,
      ...(parsed ?? {}),
    };

    // Auto-logout on 401 Unauthorized
    if (response.status === 401) {
      const { logout } = useAuthStore();
      logout({ message: error.error });
    }

    return Promise.reject(error);
  }

  // Surface warnings from API (non-blocking)
  if (parsed?.warnings?.length) {
    for (const warning of parsed.warnings as string[]) {
      toastWarning(warning, { autoClose: false });
    }
  }

  return parsed as T;
}

// ---------------------------------------------------------------------------
// Request factory
// ---------------------------------------------------------------------------

function createRequest(method: "GET" | "POST" | "DELETE") {
  return <T = unknown>(
    url: string,
    body?: unknown,
    options?: FetchApiRequestOptions,
  ): Promise<T> => {
    const config = useRuntimeConfig();
    const baseURL = config.public.apiBaseUrl as string;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Api-Version": "2",
      ...getAuthHeader(),
      ...(options?.headers ?? {}),
    };

    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined && body !== null) {
      if (options?.withUpload) {
        // FormData — let the browser set Content-Type with boundary
        requestInit.body = body as FormData;
      } else {
        headers["Content-Type"] = "application/json";
        requestInit.body = JSON.stringify(body);
      }
    }

    const queryString = buildQueryString(options?.params);

    return fetch(`${baseURL}${url}${queryString}`, requestInit).then((res) =>
      handleResponse<T>(res),
    );
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const fetchApi: FetchApiInstance = {
  get: <T = unknown>(url: string, options?: FetchApiRequestOptions) =>
    createRequest("GET")<T>(url, undefined, options),

  post: <T = unknown>(
    url: string,
    body?: unknown,
    options?: FetchApiRequestOptions,
  ) => createRequest("POST")<T>(url, body, options),

  delete: <T = unknown>(
    url: string,
    body?: unknown,
    options?: FetchApiRequestOptions,
  ) => createRequest("DELETE")<T>(url, body, options),
};
