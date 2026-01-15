/**
 * Configuration loading and management.
 * Loads settings from environment variables and .env file.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Skill configuration structure.
 */
export interface SkillConfig {
  /** Selected provider name */
  provider: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Provider-specific configurations */
  providers: {
    catbox?: { userHash?: string };
    imgbb?: { apiKey: string };
    imgur?: { clientId: string };
    freeimage?: { apiKey: string };
    imghippo?: { apiKey: string };
    weibo?: { cookies: string };
  };
}

/**
 * Default provider when none is configured.
 * Catbox works without any API key.
 */
const DEFAULT_PROVIDER = "catbox";
const DEFAULT_TIMEOUT = 30000;

/**
 * Attempts to load .env file from multiple locations.
 */
function loadEnvFile(): void {
  const envPaths = [
    // Current working directory
    path.join(process.cwd(), ".env"),
    // Skill directory
    path.join(__dirname, "..", "..", ".env"),
    // User's home directory
    path.join(process.env.HOME || "", ".claude", ".env"),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return;
    }
  }

  // No .env file found - that's okay, we have defaults
}

/**
 * Loads configuration from environment variables.
 *
 * @returns The loaded configuration
 */
export function loadConfig(): SkillConfig {
  // Load .env file if available
  loadEnvFile();

  const config: SkillConfig = {
    provider: process.env.IMAGE_UPLOAD_PROVIDER || DEFAULT_PROVIDER,
    timeout: parseInt(process.env.IMAGE_UPLOAD_TIMEOUT || String(DEFAULT_TIMEOUT), 10),
    providers: {},
  };

  // Catbox (no config required, but user hash is optional)
  if (process.env.CATBOX_USERHASH) {
    config.providers.catbox = { userHash: process.env.CATBOX_USERHASH };
  } else {
    config.providers.catbox = {}; // Always available
  }

  // ImgBB
  if (process.env.IMGBB_API_KEY) {
    config.providers.imgbb = { apiKey: process.env.IMGBB_API_KEY };
  }

  // Imgur
  if (process.env.IMGUR_CLIENT_ID) {
    config.providers.imgur = { clientId: process.env.IMGUR_CLIENT_ID };
  }

  // Freeimage.host
  if (process.env.FREEIMAGE_API_KEY) {
    config.providers.freeimage = { apiKey: process.env.FREEIMAGE_API_KEY };
  }

  // ImgHippo
  if (process.env.IMGHIPPO_API_KEY) {
    config.providers.imghippo = { apiKey: process.env.IMGHIPPO_API_KEY };
  }

  // Weibo
  if (process.env.WEIBO_COOKIES) {
    config.providers.weibo = { cookies: process.env.WEIBO_COOKIES };
  }

  return config;
}

/**
 * Gets the provider configuration for a specific provider.
 *
 * @param config - The skill configuration
 * @param providerName - The provider name
 * @returns The provider configuration or undefined
 */
export function getProviderConfig(
  config: SkillConfig,
  providerName: string
): Record<string, unknown> | undefined {
  return config.providers[providerName as keyof typeof config.providers];
}

/**
 * Determines the best available provider based on configuration.
 *
 * @param config - The skill configuration
 * @returns The recommended provider name
 */
export function getRecommendedProvider(config: SkillConfig): string {
  // If explicitly configured provider has valid config, use it
  const explicitProvider = config.provider.toLowerCase();
  if (explicitProvider === "catbox") {
    return "catbox"; // Always works
  }

  const providerConfig = getProviderConfig(config, explicitProvider);
  if (providerConfig && Object.keys(providerConfig).length > 0) {
    return explicitProvider;
  }

  // Fall back to catbox (no config required)
  return "catbox";
}
