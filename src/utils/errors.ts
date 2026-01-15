/**
 * Error types and utilities for the image upload skill.
 * Categorizes errors as fatal (stop processing) or non-fatal (skip and continue).
 */

/**
 * Error categories for upload operations.
 */
export enum ErrorCategory {
  /** File too large - non-fatal, skip this file */
  FILE_SIZE_OVERFLOW = "FILE_SIZE_OVERFLOW",
  /** Unsupported file type - non-fatal, skip this file */
  FILE_TYPE_RESTRICT = "FILE_TYPE_RESTRICT",
  /** File not found or cannot be read - non-fatal */
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  /** Authentication failure - fatal, stop queue */
  AUTH_FAILURE = "AUTH_FAILURE",
  /** Network error - could be transient, retry */
  NETWORK_ERROR = "NETWORK_ERROR",
  /** API error - check response for details */
  API_ERROR = "API_ERROR",
  /** Invalid response data - fatal */
  INVALID_RESPONSE = "INVALID_RESPONSE",
  /** Provider not configured - fatal */
  CONFIG_ERROR = "CONFIG_ERROR",
}

/**
 * Custom error class for upload operations.
 * Includes categorization for error handling decisions.
 */
export class UploadError extends Error {
  public readonly category: ErrorCategory;
  public readonly fatal: boolean;
  public readonly cause?: Error;

  constructor(
    message: string,
    category: ErrorCategory,
    fatal: boolean = false,
    cause?: Error
  ) {
    super(message);
    this.name = "UploadError";
    this.category = category;
    this.fatal = fatal;
    this.cause = cause;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UploadError);
    }
  }

  /**
   * Returns a user-friendly error message.
   */
  toUserMessage(): string {
    switch (this.category) {
      case ErrorCategory.FILE_SIZE_OVERFLOW:
        return `File too large: ${this.message}`;
      case ErrorCategory.FILE_TYPE_RESTRICT:
        return `Unsupported file type: ${this.message}`;
      case ErrorCategory.FILE_NOT_FOUND:
        return `File not found: ${this.message}`;
      case ErrorCategory.AUTH_FAILURE:
        return `Authentication failed: ${this.message}`;
      case ErrorCategory.NETWORK_ERROR:
        return `Network error: ${this.message}`;
      case ErrorCategory.API_ERROR:
        return `API error: ${this.message}`;
      case ErrorCategory.INVALID_RESPONSE:
        return `Invalid response: ${this.message}`;
      case ErrorCategory.CONFIG_ERROR:
        return `Configuration error: ${this.message}`;
      default:
        return this.message;
    }
  }
}

/**
 * Creates a file size overflow error.
 */
export function fileSizeError(
  actualSize: number,
  maxSize: number,
  provider: string
): UploadError {
  const actualMB = (actualSize / 1024 / 1024).toFixed(2);
  const maxMB = (maxSize / 1024 / 1024).toFixed(0);
  return new UploadError(
    `File size (${actualMB}MB) exceeds ${provider} limit (${maxMB}MB)`,
    ErrorCategory.FILE_SIZE_OVERFLOW,
    false
  );
}

/**
 * Creates a file type restriction error.
 */
export function fileTypeError(
  mimeType: string,
  supportedTypes: string[],
  provider: string
): UploadError {
  return new UploadError(
    `File type '${mimeType || "unknown"}' is not supported by ${provider}. Supported: ${supportedTypes.join(", ")}`,
    ErrorCategory.FILE_TYPE_RESTRICT,
    false
  );
}

/**
 * Creates an authentication error.
 */
export function authError(provider: string, details?: string): UploadError {
  const message = details
    ? `${provider} authentication failed: ${details}`
    : `${provider} requires authentication. Please configure API key or credentials.`;
  return new UploadError(message, ErrorCategory.AUTH_FAILURE, true);
}

/**
 * Creates a configuration error.
 */
export function configError(provider: string, missing: string): UploadError {
  return new UploadError(
    `${provider} requires ${missing}. Please check your .env configuration.`,
    ErrorCategory.CONFIG_ERROR,
    true
  );
}
