/* eslint-disable no-undef */
// useAuthStore is a Nuxt auto-import not visible to ESLint in .js files

export const fetchApi = {
  get: request("GET"),
  post: request("POST"),
  delete: request("DELETE"),
  getAuthHeader: authHeader,
  // put: request('PUT'),
};
function request(method) {
  return (url, body, options) => {
    const runtimeConfig = useRuntimeConfig();
    const requestOptions = {
      method,
      ...options,
      headers: {
        Accept: "application/json",
        "X-Api-Version": 2,
        ...authHeader(url),
        ...options?.headers,
      },
    };

    if (body) {
      // Se non è una chiamata con file in upload, aggiungo il content-type
      if (!requestOptions.withUpload) {
        requestOptions.headers["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(body);
      } else {
        requestOptions.body = body;
      }
    }
    const paramsString =
      options && options.params
        ? "?" + new URLSearchParams(options.params)
        : "";

    // Questa chiamata è alla fetch del browser, mentre $fetch userebbe ofetch,
    // che però dà problemi nel recupero del data in caso di errore (è inaccessibile)
    // Per questo creo la paramsString e la aggiungo alla url a mano
    return fetch(
      runtimeConfig.public.apiBaseUrl + url + paramsString,
      requestOptions,
    ).then(handleResponse);
  };
}

// helper functions

function authHeader() {
  const { token } = useAuthStore();
  return { Authorization: `Bearer ${token}` };
}

function handleResponse(response) {
  // if has attachments, downloads the file
  const contentDisposition = response.headers.get("Content-Disposition");
  if (contentDisposition && contentDisposition.startsWith("attachment")) {
    return response.blob().then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = contentDisposition
        .split(";")[1]
        .split("=")[1]
        .replace(/"/g, "");
      a.click();
      return Promise.resolve();
    });
  }

  // if response is not json then return text
  const contentType = response.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/json")) {
    return response.text().then((text) => {
      if (!response.ok) {
        const error = {
          error: text,
          status: response.statusText,
        };
        return Promise.reject(error);
      }
      return text;
    });
  }

  // if JSON
  return response.text().then((text) => {
    const parsed = text && JSON.parse(text);
    if (!response.ok) {
      const { logout } = useAuthStore();
      // console.log(parsed, response);
      const error = {
        error: parsed.data ? parsed.data.error : parsed.error,
        status: response.statusText,
        ...(parsed || {}),
      };
      if ([401].includes(response.status)) {
        logout({ message: error.error });
      }

      // console.log(error);
      return Promise.reject(error);
    }

    if (parsed.warnings?.length) {
      parsed.warnings.forEach((w) => {
        toastWarning(w, { autoClose: false });
      });
    }

    return parsed;
  });
}
