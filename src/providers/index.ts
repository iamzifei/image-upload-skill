/**
 * Provider registry and factory.
 * Manages available image hosting providers.
 */

import type {
  ImageProvider,
  ProviderConfig,
  ProviderConstructor,
} from "./types.js";
import { CatboxProvider } from "./catbox.js";
import { ImgBBProvider } from "./imgbb.js";
import { ImgurProvider } from "./imgur.js";
import { FreeimageProvider } from "./freeimage.js";
import { ImgHippoProvider } from "./imghippo.js";
import { WeiboProvider } from "./weibo.js";
import { UploadError, ErrorCategory } from "../utils/errors.js";

/**
 * Registry of all available providers.
 */
const providerRegistry = new Map<string, ProviderConstructor>();
providerRegistry.set("catbox", CatboxProvider);
providerRegistry.set("imgbb", ImgBBProvider);
providerRegistry.set("imgur", ImgurProvider);
providerRegistry.set("freeimage", FreeimageProvider);
providerRegistry.set("imghippo", ImgHippoProvider);
providerRegistry.set("weibo", WeiboProvider);

/**
 * Default provider when none is specified.
 * Catbox is chosen because it works without any configuration.
 */
export const DEFAULT_PROVIDER = "catbox";

/**
 * Gets a list of all available provider names.
 */
export function getAvailableProviders(): string[] {
  return Array.from(providerRegistry.keys());
}

/**
 * Gets provider information for display.
 */
export function getProviderInfo(): Array<{
  name: string;
  displayName: string;
  requiresConfig: boolean;
  maxFileSize: number;
}> {
  return [
    {
      name: "catbox",
      displayName: "Catbox.moe",
      requiresConfig: false,
      maxFileSize: 200 * 1024 * 1024,
    },
    {
      name: "imgbb",
      displayName: "ImgBB",
      requiresConfig: true,
      maxFileSize: 32 * 1024 * 1024,
    },
    {
      name: "imgur",
      displayName: "Imgur",
      requiresConfig: true,
      maxFileSize: 20 * 1024 * 1024,
    },
    {
      name: "freeimage",
      displayName: "Freeimage.host",
      requiresConfig: true,
      maxFileSize: 64 * 1024 * 1024,
    },
    {
      name: "imghippo",
      displayName: "ImgHippo",
      requiresConfig: true,
      maxFileSize: 50 * 1024 * 1024,
    },
    {
      name: "weibo",
      displayName: "Weibo (Legacy)",
      requiresConfig: true,
      maxFileSize: 20 * 1024 * 1024,
    },
  ];
}

/**
 * Creates a provider instance.
 *
 * @param name - The provider name (e.g., 'catbox', 'imgbb')
 * @param config - Provider-specific configuration
 * @returns An initialized provider instance
 * @throws UploadError if provider is not found
 */
export function createProvider(
  name: string,
  config: ProviderConfig = {}
): ImageProvider {
  const normalizedName = name.toLowerCase();
  const ProviderClass = providerRegistry.get(normalizedName);

  if (!ProviderClass) {
    throw new UploadError(
      `Unknown provider: ${name}. Available providers: ${getAvailableProviders().join(", ")}`,
      ErrorCategory.CONFIG_ERROR,
      true
    );
  }

  return new ProviderClass(config);
}

/**
 * Checks if a provider name is valid.
 */
export function isValidProvider(name: string): boolean {
  return providerRegistry.has(name.toLowerCase());
}

// Re-export types
export type { ImageProvider, ProviderConfig, UploadResult } from "./types.js";
