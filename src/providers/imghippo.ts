/**
 * ImgHippo image hosting provider.
 *
 * API: POST https://api.imghippo.com/v1/upload
 * Docs: https://www.imghippo.com/
 *
 * Features:
 * - Requires API key
 * - Max file size: 50MB
 * - May have Cloudflare verification issues
 */

import type { ImageProvider, ProviderConfig, UploadResult } from "./types.js";
import { createFormattedOutput } from "./types.js";
import { fetchWithRetry } from "../utils/fetch.js";
import { UploadError, ErrorCategory, configError } from "../utils/errors.js";

const API_URL = "https://api.imghippo.com/v1/upload";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export class ImgHippoProvider implements ImageProvider {
  readonly name = "imghippo";
  readonly displayName = "ImgHippo";
  readonly requiresConfig = true;
  readonly maxFileSize = MAX_FILE_SIZE;
  readonly supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  private apiKey: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw configError(
        "ImgHippo",
        "API key (get one at https://www.imghippo.com/)"
      );
    }
    this.apiKey = config.apiKey;
  }

  async upload(
    buffer: Buffer,
    filename?: string,
    mimeType?: string
  ): Promise<UploadResult> {
    // Build form data for multipart upload
    const formData = new FormData();
    formData.append("api_key", this.apiKey);

    // Create blob from buffer
    const blob = new Blob([buffer], {
      type: mimeType || "application/octet-stream",
    });
    const uploadFilename = filename || `image${this.getExtension(mimeType)}`;
    formData.append("file", blob, uploadFilename);

    try {
      const response = await fetchWithRetry(API_URL, {
        method: "POST",
        body: formData,
      });

      const json = await response.json() as {
        success: boolean;
        status: number;
        message?: string;
        data?: {
          id: string;
          url: string;
          view_url?: string;
          delete_url?: string;
          title?: string;
          width?: number;
          height?: number;
          size?: number;
        };
      };

      if (!json.success || !json.data) {
        throw new UploadError(
          json.message || "Upload failed",
          ErrorCategory.API_ERROR,
          false
        );
      }

      const { data } = json;
      const name = data.title || filename || "image";

      return {
        id: data.id,
        url: data.url,
        viewerUrl: data.view_url,
        deleteUrl: data.delete_url,
        size: data.size,
        width: data.width,
        height: data.height,
        formatted: createFormattedOutput(data.url, name),
      };
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError(
        (error as Error).message || "Upload to ImgHippo failed",
        ErrorCategory.NETWORK_ERROR,
        false,
        error as Error
      );
    }
  }

  private getExtension(mimeType?: string): string {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };
    return mimeToExt[mimeType || ""] || ".png";
  }
}
