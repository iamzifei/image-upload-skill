/**
 * Type definitions for image hosting providers.
 */

/**
 * Result of a successful image upload.
 * Includes the raw URL and pre-formatted output strings.
 */
export interface UploadResult {
  /** The unique identifier from the provider */
  id: string;
  /** The direct URL to the uploaded image */
  url: string;
  /** URL to the viewer/landing page (if available) */
  viewerUrl?: string;
  /** URL for deletion (if available) */
  deleteUrl?: string;
  /** File size in bytes */
  size?: number;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Pre-formatted output strings */
  formatted: {
    url: string;
    markdown: string;
    html: string;
    bbcode: string;
  };
}

/**
 * Configuration for a provider.
 * Each provider implementation may require different fields.
 */
export interface ProviderConfig {
  apiKey?: string;
  clientId?: string;
  userHash?: string;
  cookies?: string;
  [key: string]: unknown;
}

/**
 * Abstract interface for all image hosting providers.
 * Implementations must handle their own authentication and API specifics.
 */
export interface ImageProvider {
  /** Unique identifier for this provider (lowercase) */
  readonly name: string;

  /** Human-readable display name */
  readonly displayName: string;

  /** Whether this provider requires configuration (API key, etc.) */
  readonly requiresConfig: boolean;

  /** Maximum file size in bytes */
  readonly maxFileSize: number;

  /** Supported MIME types */
  readonly supportedTypes: string[];

  /**
   * Uploads an image to the provider.
   *
   * @param buffer - The image data as a Buffer
   * @param filename - Optional filename for the upload
   * @param mimeType - The MIME type of the image
   * @returns Promise resolving to the upload result
   * @throws UploadError on upload failure
   */
  upload(
    buffer: Buffer,
    filename?: string,
    mimeType?: string
  ): Promise<UploadResult>;
}

/**
 * Provider constructor type.
 */
export type ProviderConstructor = new (config: ProviderConfig) => ImageProvider;

/**
 * Helper to create formatted output strings.
 */
export function createFormattedOutput(
  url: string,
  name: string = "image"
): UploadResult["formatted"] {
  return {
    url: url,
    markdown: `![${name}](${url})`,
    html: `<img src="${url}" alt="${name}">`,
    bbcode: `[IMG]${url}[/IMG]`,
  };
}
