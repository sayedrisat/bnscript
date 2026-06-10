import { BNRuntimeError } from "./errors.js";

const DEFAULT_TIMEOUT_MS = 30000;

function isPlainObjectBody(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !(value instanceof ArrayBuffer) &&
    !(value instanceof URLSearchParams) &&
    !(typeof FormData !== "undefined" && value instanceof FormData) &&
    !(typeof Blob !== "undefined" && value instanceof Blob)
  );
}

function headerValue(headers, name) {
  if (!headers) {
    return undefined;
  }

  if (typeof headers.get === "function") {
    return headers.get(name);
  }

  const key = Object.keys(headers).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase()
  );
  return key ? headers[key] : undefined;
}

async function fetchResponse(url, options = {}) {
  if (typeof fetch !== "function") {
    throw new BNRuntimeError("Native fetch is not available in this Node.js runtime.", {
      operation: "fetch",
      url,
    });
  }

  const method = (options.method || "GET").toUpperCase();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;

  if (!Number.isFinite(timeout) || timeout < 0) {
    throw new BNRuntimeError(`fetch timeout must be a non-negative number, got: ${timeout}`, {
      operation: "fetch",
      url,
      method,
      timeout,
    });
  }

  const headers = { ...(options.headers || {}) };
  let body = options.body;

  if (body !== undefined && isPlainObjectBody(body)) {
    body = JSON.stringify(body);
    if (!headerValue(headers, "content-type")) {
      headers["Content-Type"] = "application/json";
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new BNRuntimeError(
        `HTTP request failed: ${method} ${url} returned status ${response.status}`,
        {
          operation: "fetch",
          url,
          method,
          status: response.status,
          statusText: response.statusText,
        }
      );
    }

    return response;
  } catch (error) {
    if (error instanceof BNRuntimeError) {
      throw error;
    }

    if (error?.name === "AbortError") {
      throw new BNRuntimeError(
        `HTTP request timed out after ${timeout}ms: ${method} ${url}`,
        {
          operation: "fetch",
          url,
          method,
          timeout,
          cause: error,
        }
      );
    }

    throw new BNRuntimeError(`HTTP request failed: ${error.message}`, {
      operation: "fetch",
      url,
      method,
      cause: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function __bn_fetch(url, options = {}) {
  const response = await fetchResponse(url, options);
  const contentType = response.headers?.get("content-type") || "";

  if (contentType.includes("application/json") || contentType.includes("+json")) {
    return await response.json();
  }

  return await response.text();
}

export async function __bn_httpGet(url, options = {}) {
  const response = await fetchResponse(url, {
    ...options,
    method: "GET",
  });

  return await response.text();
}
