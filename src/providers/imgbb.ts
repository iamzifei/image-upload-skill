/**
 * ImgBB image hosting provider.
 *
 * API: POST https://api.imgbb.com/1/upload
 * Docs: https://api.imgbb.com/
 *
 * Features:
 * - Requires free API key
 * - Max file size: 32MB
 * - Supports base64 and URL uploads
 * - Optional auto-deletion after specified time
 */

import type { ImageProvider, ProviderConfig, UploadResult } from "./types.js";
import { createFormattedOutput } from "./types.js";
import { fetchWithRetry, buildURL } from "../utils/fetch.js";
import { UploadError, ErrorCategory, configError } from "../utils/errors.js";

const API_URL = "https://api.imgbb.com/1/upload";
const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB

export class ImgBBProvider implements ImageProvider {
  readonly name = "imgbb";
  readonly displayName = "ImgBB";
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
      throw configError("ImgBB", "API key (get one free at https://api.imgbb.com/)");
    }
    this.apiKey = config.apiKey;
  }

  async upload(
    buffer: Buffer,
    filename?: string,
    _mimeType?: string
  ): Promise<UploadResult> {
    // ImgBB accepts base64 encoded images
    const base64Data = buffer.toString("base64");

    // Build form data
    const formData = new FormData();
    formData.append("key", this.apiKey);
    formData.append("image", base64Data);
    if (filename) {
      formData.append("name", filename);
    }

    try {
      const response = await fetchWithRetry(API_URL, {
        method: "POST",
        body: formData,
      });

      const json = await response.json() as {
        success: boolean;
        data?: {
          id: string;
          url: string;
          url_viewer?: string;
          delete_url?: string;
          title?: string;
          size?: number;
          width?: number;
          height?: number;
        };
        error?: { message: string };
      };

      if (!json.success || !json.data) {
        throw new UploadError(
          json.error?.message || "Upload failed",
          ErrorCategory.API_ERROR,
          false
        );
      }

      const { data } = json;
      const name = data.title || filename || "image";

      return {
        id: data.id,
        url: data.url,
        viewerUrl: data.url_viewer,
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
        (error as Error).message || "Upload to ImgBB failed",
        ErrorCategory.NETWORK_ERROR,
        false,
        error as Error
      );
    }
  }
}
