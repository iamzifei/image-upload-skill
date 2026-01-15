/**
 * Weibo image hosting provider (Legacy).
 *
 * API: POST https://picupload.weibo.com/interface/pic_upload.php
 *
 * Features:
 * - Requires Weibo login cookies
 * - Max file size: 20MB
 * - Fast CDN in China, slow internationally
 * - Risk of external links being blocked
 *
 * Note: This is a legacy provider preserved from the original extension.
 * Not recommended for production use due to stability concerns.
 */

import type { ImageProvider, ProviderConfig, UploadResult } from "./types.js";
import { createFormattedOutput } from "./types.js";
import { fetchWithRetry, buildURL } from "../utils/fetch.js";
import { UploadError, ErrorCategory, configError } from "../utils/errors.js";

const API_URL = "https://picupload.weibo.com/interface/pic_upload.php";
const MAX_FILE_SIZE = 20 * 1024 * 1024 - 1; // ~20MB

// Weibo CDN hosts for image URLs
const IMAGE_HOSTS = [
  "tvax1.sinaimg.cn",
  "tvax2.sinaimg.cn",
  "tvax3.sinaimg.cn",
  "tvax4.sinaimg.cn",
  "tva1.sinaimg.cn",
  "tva2.sinaimg.cn",
  "tva3.sinaimg.cn",
  "tva4.sinaimg.cn",
];

export class WeiboProvider implements ImageProvider {
  readonly name = "weibo";
  readonly displayName = "Weibo (Legacy)";
  readonly requiresConfig = true;
  readonly maxFileSize = MAX_FILE_SIZE;
  readonly supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/apng",
    "image/gif",
  ];

  private cookies: string;

  constructor(config: ProviderConfig) {
    if (!config.cookies) {
      throw configError(
        "Weibo",
        "cookies (export from browser after logging into weibo.com)"
      );
    }
    this.cookies = config.cookies;
  }

  async upload(
    buffer: Buffer,
    filename?: string,
    mimeType?: string
  ): Promise<UploadResult> {
    // Build query parameters
    const params = {
      s: "xml",
      ori: "1",
      data: "1",
      rotate: "0",
      wm: "",
      app: "miniblog",
      mime: mimeType || "image/jpeg",
    };

    const url = buildURL(API_URL, params);

    try {
      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: {
          Cookie: this.cookies,
          Referer: "https://weibo.com/",
        },
        body: buffer,
      });

      const text = await response.text();

      // Parse XML response to extract PID
      const pidMatch = text.match(/<pid>([^<]+)<\/pid>/);
      if (!pidMatch) {
        // Check for login required error
        if (text.includes("login") || text.includes("请登录")) {
          throw new UploadError(
            "Weibo session expired. Please update your cookies.",
            ErrorCategory.AUTH_FAILURE,
            true
          );
        }
        throw new UploadError(
          "Failed to parse Weibo response - no PID found",
          ErrorCategory.INVALID_RESPONSE,
          false
        );
      }

      const pid = pidMatch[1];
      const host = IMAGE_HOSTS[Math.floor(Math.random() * IMAGE_HOSTS.length)];
      const ext = this.getExtension(mimeType);
      const imageUrl = `https://${host}/large/${pid}${ext}`;
      const name = filename || pid;

      return {
        id: pid,
        url: imageUrl,
        formatted: createFormattedOutput(imageUrl, name),
      };
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError(
        (error as Error).message || "Upload to Weibo failed",
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
      "image/apng": ".png",
      "image/gif": ".gif",
    };
    return mimeToExt[mimeType || ""] || ".jpg";
  }
}
