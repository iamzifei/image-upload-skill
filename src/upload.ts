/**
 * Core upload logic following the reader -> purifier -> uploader pipeline.
 * Adapted from Weibo-Picture-Store src/scripts/weibo/upload.ts
 */

import * as fs from "fs/promises";
import * as path from "path";
import { createProvider, type UploadResult } from "./providers/index.js";
import { loadConfig, getProviderConfig, getRecommendedProvider } from "./config/index.js";
import { detectMimeType } from "./utils/mime.js";
import {
  UploadError,
  ErrorCategory,
  fileSizeError,
  fileTypeError,
} from "./utils/errors.js";

/**
 * Upload options.
 */
export interface UploadOptions {
  /** Provider name (defaults to configured or catbox) */
  provider?: string;
  /** Custom filename for the upload */
  name?: string;
}

/**
 * Main upload function - the primary entry point for the skill.
 *
 * Pipeline: reader -> purifier -> uploader
 *
 * @param imagePath - Path to the local image file
 * @param options - Upload options
 * @returns Upload result with URL and formatted strings
 */
export async function uploadImage(
  imagePath: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const config = loadConfig();
  const providerName = options.provider || getRecommendedProvider(config);
  const providerConfig = getProviderConfig(config, providerName) || {};

  // Create provider instance
  const provider = createProvider(providerName, providerConfig);

  // Step 1: Reader - Read the image file
  const absolutePath = path.resolve(imagePath);
  const buffer = await reader(absolutePath);

  // Step 2: Detect MIME type
  const mimeType = detectMimeType(buffer);

  // Step 3: Purifier - Validate file against provider constraints
  await purifier(buffer, mimeType, provider.maxFileSize, provider.supportedTypes, provider.displayName);

  // Step 4: Uploader - Upload to the provider
  const filename = options.name || path.basename(imagePath, path.extname(imagePath));
  const result = await provider.upload(buffer, filename, mimeType);

  return result;
}

/**
 * Reader phase: Read file from disk.
 *
 * @param filePath - Absolute path to the file
 * @returns File contents as Buffer
 */
async function reader(filePath: string): Promise<Buffer> {
  try {
    const stats = await fs.stat(filePath);

    if (!stats.isFile()) {
      throw new UploadError(
        `Path is not a file: ${filePath}`,
        ErrorCategory.FILE_NOT_FOUND,
        false
      );
    }

    return await fs.readFile(filePath);
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }

    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      throw new UploadError(
        `File not found: ${filePath}`,
        ErrorCategory.FILE_NOT_FOUND,
        false
      );
    }

    throw new UploadError(
      `Failed to read file: ${nodeError.message}`,
      ErrorCategory.FILE_NOT_FOUND,
      false,
      error as Error
    );
  }
}

/**
 * Purifier phase: Validate file against provider constraints.
 *
 * @param buffer - File contents
 * @param mimeType - Detected MIME type
 * @param maxSize - Provider's max file size
 * @param supportedTypes - Provider's supported MIME types
 * @param providerName - Provider display name for error messages
 */
async function purifier(
  buffer: Buffer,
  mimeType: string,
  maxSize: number,
  supportedTypes: string[],
  providerName: string
): Promise<void> {
  // Check file type support
  if (!mimeType || !supportedTypes.includes(mimeType)) {
    throw fileTypeError(mimeType, supportedTypes, providerName);
  }

  // Check file size
  if (buffer.length > maxSize) {
    throw fileSizeError(buffer.length, maxSize, providerName);
  }
}

/**
 * Format the upload result for display.
 *
 * @param result - Upload result
 * @param format - Output format (url, markdown, html, bbcode, all)
 * @returns Formatted string
 */
export function formatResult(
  result: UploadResult,
  format: "url" | "markdown" | "html" | "bbcode" | "all" = "all"
): string {
  switch (format) {
    case "url":
      return result.url;
    case "markdown":
      return result.formatted.markdown;
    case "html":
      return result.formatted.html;
    case "bbcode":
      return result.formatted.bbcode;
    case "all":
    default:
      return [
        `URL: ${result.url}`,
        `Markdown: ${result.formatted.markdown}`,
        `HTML: ${result.formatted.html}`,
        `BBCode: ${result.formatted.bbcode}`,
      ].join("\n");
  }
}

// Re-export types
export type { UploadResult } from "./providers/index.js";
