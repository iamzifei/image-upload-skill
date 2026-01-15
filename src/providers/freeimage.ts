/**
 * Freeimage.host image hosting provider.
 *
 * API: POST https://freeimage.host/api/1/upload/
 * Docs: https://freeimage.host/page/api
 *
 * Features:
 * - Requires free API key
 * - Max file size: 64MB
 * - Supports base64 and URL uploads
 */

import type { ImageProvider, ProviderConfig, UploadResult } from "./types.js";
import { createFormattedOutput } from "./types.js";
import { fetchWithRetry } from "../utils/fetch.js";
import { UploadError, ErrorCategory, configError } from "../utils/errors.js";

const API_URL = "https://freeimage.host/api/1/upload/";
const MAX_FILE_SIZE = 64 * 1024 * 1024; // 64MB

export class FreeimageProvider implements ImageProvider {
  readonly name = "freeimage";
  readonly displayName = "Freeimage.host";
  readonly requiresConfig = true;
  readonly maxFileSize = MAX_FILE_SIZE;
  readonly supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  private apiKey: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw configError(
        "Freeimage.host",
        "API key (get one free at https://freeimage.host/page/api)"
      );
    }
    this.apiKey = config.apiKey;
  }

  async upload(
    buffer: Buffer,
    filename?: string,
    _mimeType?: string
  ): Promise<UploadResult> {
    // Freeimage accepts base64 encoded images
    const base64Data = buffer.toString("base64");

    // Build form data
    const formData = new FormData();
    formData.append("key", this.apiKey);
    formData.append("action", "upload");
    formData.append("source", base64Data);
    formData.append("format", "json");

    try {
      const response = await fetchWithRetry(API_URL, {
        method: "POST",
        body: formData,
      });

      const json = await response.json() as {
        status_code: number;
        success?: { message: string; code: number };
        error?: { message: string; code: number };
        image?: {
          name: string;
          extension: string;
          size: number;
          width: number;
          height: number;
          url: string;
          url_viewer: string;
          delete_url?: string;
        };
      };

      if (json.status_code !== 200 || !json.image) {
        throw new UploadError(
          json.error?.message || "Upload failed",
          ErrorCategory.API_ERROR,
          false
        );
      }

      const { image } = json;
      const name = filename || image.name || "image";

      return {
        id: image.name,
        url: image.url,
        viewerUrl: image.url_viewer,
        deleteUrl: image.delete_url,
        size: image.size,
        width: image.width,
        height: image.height,
        formatted: createFormattedOutput(image.url, name),
      };
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError(
        (error as Error).message || "Upload to Freeimage.host failed",
        ErrorCategory.NETWORK_ERROR,
        false,
        error as Error
      );
    }
  }
}
