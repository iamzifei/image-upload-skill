#!/usr/bin/env node

/**
 * Image Upload Skill - CLI Entry Point
 *
 * Upload images to various hosting providers from the command line.
 *
 * Usage:
 *   npx image-upload <image-path> [--provider <name>] [--name <filename>]
 *
 * Examples:
 *   npx image-upload ./screenshot.png
 *   npx image-upload ./photo.jpg --provider imgur
 *   npx image-upload ./image.png --name my-image
 */

import { uploadImage, formatResult } from "./upload.js";
import { getAvailableProviders, getProviderInfo } from "./providers/index.js";
import { UploadError } from "./utils/errors.js";

/**
 * Parse command line arguments.
 */
function parseArgs(args: string[]): {
  imagePath?: string;
  provider?: string;
  name?: string;
  help?: boolean;
  list?: boolean;
} {
  const result: ReturnType<typeof parseArgs> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--list" || arg === "-l") {
      result.list = true;
    } else if (arg === "--provider" || arg === "-p") {
      result.provider = args[++i];
    } else if (arg === "--name" || arg === "-n") {
      result.name = args[++i];
    } else if (!arg.startsWith("-")) {
      result.imagePath = arg;
    }
  }

  return result;
}

/**
 * Print help message.
 */
function printHelp(): void {
  console.log(`
Image Upload Skill - Upload images to various hosting providers

Usage:
  image-upload <image-path> [options]

Options:
  -p, --provider <name>  Provider to use (default: catbox)
  -n, --name <filename>  Custom filename for the upload
  -l, --list             List available providers
  -h, --help             Show this help message

Examples:
  image-upload ./screenshot.png
  image-upload ./photo.jpg --provider imgur
  image-upload ./image.png --name my-screenshot

Available Providers:
  catbox     - Catbox.moe (default, no config required, 200MB max)
  imgbb      - ImgBB (requires API key, 32MB max)
  imgur      - Imgur (requires Client-ID, 20MB max)
  freeimage  - Freeimage.host (requires API key, 64MB max)
  imghippo   - ImgHippo (requires API key, 50MB max)
  weibo      - Weibo (requires cookies, 20MB max)

Configuration:
  Create a .env file with your API keys. See .env.example for details.
  Catbox works without any configuration!
`);
}

/**
 * Print provider list.
 */
function printProviders(): void {
  console.log("\nAvailable Image Hosting Providers:\n");
  console.log("| Provider    | Max Size | Config Required | Notes                    |");
  console.log("|-------------|----------|-----------------|--------------------------|");

  const providers = getProviderInfo();
  for (const p of providers) {
    const size = `${Math.round(p.maxFileSize / 1024 / 1024)}MB`;
    const config = p.requiresConfig ? "Yes" : "No";
    const notes = p.name === "catbox" ? "Default, anonymous" : "";
    console.log(
      `| ${p.displayName.padEnd(11)} | ${size.padEnd(8)} | ${config.padEnd(15)} | ${notes.padEnd(24)} |`
    );
  }

  console.log("\nTo use a provider, set IMAGE_UPLOAD_PROVIDER in your .env file");
  console.log("or use the --provider flag.\n");
}

/**
 * Main function.
 */
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.list) {
    printProviders();
    process.exit(0);
  }

  if (!args.imagePath) {
    console.error("Error: No image path provided.\n");
    printHelp();
    process.exit(1);
  }

  try {
    console.log(`Uploading ${args.imagePath}...`);

    const result = await uploadImage(args.imagePath, {
      provider: args.provider,
      name: args.name,
    });

    console.log("\nUpload successful!\n");
    console.log(formatResult(result));

    if (result.viewerUrl) {
      console.log(`\nViewer: ${result.viewerUrl}`);
    }
    if (result.deleteUrl) {
      console.log(`Delete: ${result.deleteUrl}`);
    }
  } catch (error) {
    if (error instanceof UploadError) {
      console.error(`\nError: ${error.toUserMessage()}`);
      if (error.fatal) {
        console.error("This is a fatal error. Please check your configuration.");
      }
    } else {
      console.error(`\nError: ${(error as Error).message}`);
    }
    process.exit(1);
  }
}

// Run main function
main();

// Export for programmatic use
export { uploadImage, formatResult } from "./upload.js";
export { createProvider, getAvailableProviders, getProviderInfo } from "./providers/index.js";
export type { UploadResult, UploadOptions } from "./upload.js";
