/**
 * Catbox.moe image hosting provider.
 *
 * API: POST https://catbox.moe/user/api.php
 * Docs: https://catbox.moe/tools.php
 *
 * Features:
 * - No API key required for anonymous uploads
 * - Permanent storage (unless content violates TOS)
 * - Max file size: 200MB
 * - Optional user hash for file management
 */

import type { ImageProvider, ProviderConfig, UploadResult } from "./types.js";
import { createFormattedOutput } from "./types.js";
import { fetchWithRetry } from "../utils/fetch.js";
import { UploadError, ErrorCategory } from "../utils/errors.js";

const API_URL = "https://catbox.moe/user/api.php";
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

export class CatboxProvider implements ImageProvider {
  readonly name = "catbox";
  readonly displayName = "Catbox.moe";
  readonly requiresConfig = false; // Works without any configuration!
  readonly maxFileSize = MAX_FILE_SIZE;
  readonly supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/x-icon",
  ];

  private userHash?: string;

  constructor(config: ProviderConfig) {
    // User hash is optional - allows file management if provided
    this.userHash = config.userHash as string | undefined;
  }

  async upload(
    buffer: Buffer,
    filename?: string,
    mimeType?: string
  ): Promise<UploadResult> {
    // Build form data for multipart upload
    const formData = new FormData();
    formData.append("reqtype", "fileupload");

    // Add user hash if available (for file management)
    if (this.userHash) {
      formData.append("userhash", this.userHash);
    }

    // Create blob from buffer with proper MIME type
    const blob = new Blob([buffer], { type: mimeType || "application/octet-stream" });
    const uploadFilename = filename || `image${this.getExtension(mimeType)}`;
    formData.append("fileToUpload", blob, uploadFilename);

    try {
      const response = await fetchWithRetry(API_URL, {
        method: "POST",
        body: formData,
      });

      // Catbox returns plain text URL on success
      const text = await response.text();

      // Check for error responses
      if (!text.startsWith("https://")) {
        throw new UploadError(
          text || "Upload failed - no URL returned",
          ErrorCategory.API_ERROR,
          false
        );
      }

      const url = text.trim();
      const id = url.split("/").pop() || "";
      const name = filename || id;

      return {
        id,
        url,
        formatted: createFormattedOutput(url, name),
      };
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError(
        (error as Error).message || "Upload to Catbox failed",
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
      "image/bmp": ".bmp",
      "image/x-icon": ".ico",
    };
    return mimeToExt[mimeType || ""] || ".png";
  }
}
