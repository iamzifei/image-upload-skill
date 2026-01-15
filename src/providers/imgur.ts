/**
 * Imgur image hosting provider.
 *
 * API: POST https://api.imgur.com/3/image
 * Docs: https://apidocs.imgur.com/
 *
 * Features:
 * - Requires Client-ID (free registration)
 * - Max file size: 20MB (images), 200MB (GIFs)
 * - Anonymous uploads using Client-ID
 * - Rate limits: ~1,250 uploads/day
 */

import type { ImageProvider, ProviderConfig, UploadResult } from "./types.js";
import { createFormattedOutput } from "./types.js";
import { fetchWithRetry } from "../utils/fetch.js";
import { UploadError, ErrorCategory, configError } from "../utils/errors.js";

const API_URL = "https://api.imgur.com/3/image";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB for regular images

export class ImgurProvider implements ImageProvider {
  readonly name = "imgur";
  readonly displayName = "Imgur";
  readonly requiresConfig = true;
  readonly maxFileSize = MAX_FILE_SIZE;
  readonly supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/apng",
    "image/tiff",
  ];

  private clientId: string;

  constructor(config: ProviderConfig) {
    if (!config.clientId) {
      throw configError(
        "Imgur",
        "Client-ID (register at https://api.imgur.com/oauth2/addclient)"
      );
    }
    this.clientId = config.clientId;
  }

  async upload(
    buffer: Buffer,
    filename?: string,
    _mimeType?: string
  ): Promise<UploadResult> {
    // Imgur accepts base64 encoded images
    const base64Data = buffer.toString("base64");

    // Build form data
    const formData = new FormData();
    formData.append("image", base64Data);
    formData.append("type", "base64");
    if (filename) {
      formData.append("name", filename);
    }

    try {
      const response = await fetchWithRetry(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${this.clientId}`,
        },
        body: formData,
      });

      const json = await response.json() as {
        success: boolean;
        data?: {
          id: string;
          link: string;
          deletehash?: string;
          title?: string;
          size?: number;
          width?: number;
          height?: number;
        };
        status: number;
      };

      if (!json.success || !json.data) {
        throw new UploadError(
          `Upload failed with status ${json.status}`,
          ErrorCategory.API_ERROR,
          false
        );
      }

      const { data } = json;
      const name = data.title || filename || "image";
      const deleteUrl = data.deletehash
        ? `https://imgur.com/delete/${data.deletehash}`
        : undefined;

      return {
        id: data.id,
        url: data.link,
        viewerUrl: `https://imgur.com/${data.id}`,
        deleteUrl,
        size: data.size,
        width: data.width,
        height: data.height,
        formatted: createFormattedOutput(data.link, name),
      };
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError(
        (error as Error).message || "Upload to Imgur failed",
        ErrorCategory.NETWORK_ERROR,
        false,
        error as Error
      );
    }
  }
}
