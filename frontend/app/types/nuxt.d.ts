declare module "#app" {
  interface NuxtApp {
    $fetchApi: {
      get: <T = unknown>(
        url: string,
        options?: Record<string, unknown>,
      ) => Promise<T>;
      post: <T = unknown>(
        url: string,
        body?: unknown,
        options?: Record<string, unknown>,
      ) => Promise<T>;
      delete: <T = unknown>(
        url: string,
        body?: unknown,
        options?: Record<string, unknown>,
      ) => Promise<T>;
    };
    $toast: {
      success: (text: string, options?: Record<string, unknown>) => void;
      error: (text: string, options?: Record<string, unknown>) => void;
      warning: (text: string, options?: Record<string, unknown>) => void;
      info: (text: string, options?: Record<string, unknown>) => void;
    };
  }
}

export {};
