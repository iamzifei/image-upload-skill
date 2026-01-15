/**
 * HTTP fetch wrapper with timeout and retry support.
 * Adapted from Weibo-Picture-Store src/scripts/sharre/utils.ts
 */

import { UploadError, ErrorCategory } from "./errors.js";

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Sleep for a specified number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Enhanced fetch wrapper with timeout, retry, and error handling.
 *
 * @param url - The URL to fetch
 * @param options - Fetch options including optional timeout
 * @param retries - Number of retry attempts for transient errors
 * @returns The fetch Response
 * @throws UploadError on failure
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {},
  retries: number = 2
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Don't retry client errors (4xx)
      const shouldRetry = response.status >= 500 && retries > 0;
      if (shouldRetry) {
        await sleep(1000);
        return fetchWithRetry(url, options, retries - 1);
      }

      throw new UploadError(
        `HTTP ${response.status}: ${response.statusText}`,
        ErrorCategory.NETWORK_ERROR,
        false
      );
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Re-throw UploadError as-is
    if (error instanceof UploadError) {
      if (retries > 0 && !error.fatal) {
        await sleep(1000);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }

    // Handle abort (timeout)
    if ((error as Error).name === "AbortError") {
      if (retries > 0) {
        await sleep(1000);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw new UploadError(
        `Request timed out after ${timeout}ms`,
        ErrorCategory.NETWORK_ERROR,
        false,
        error as Error
      );
    }

    // Handle other network errors
    if (retries > 0) {
      await sleep(1000);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw new UploadError(
      (error as Error).message || "Network request failed",
      ErrorCategory.NETWORK_ERROR,
      false,
      error as Error
    );
  }
}

/**
 * Build a URL with query parameters.
 *
 * @param baseUrl - The base URL
 * @param params - Query parameters as key-value pairs
 * @returns The complete URL with query string
 */
export function buildURL(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}
