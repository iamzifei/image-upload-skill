/**
 * MIME type detection using magic bytes.
 * Adapted from Weibo-Picture-Store src/scripts/sharre/bitmap-mime.ts
 */

interface BitmapPatternItem {
  pattern: number[];
  mask: number[];
  ignored: number[];
  type: string;
  note?: string;
}

const UNKNOWN_BITMAP_MIME = "";

/**
 * Magic byte patterns for detecting image types.
 * Based on WHATWG MIME Sniffing specification.
 */
const BITMAP_PATTERN_TABLE: BitmapPatternItem[] = [
  {
    pattern: [0x00, 0x00, 0x01, 0x00],
    mask: [0xff, 0xff, 0xff, 0xff],
    ignored: [],
    type: "image/x-icon",
    note: "A Windows Icon signature.",
  },
  {
    pattern: [0x00, 0x00, 0x02, 0x00],
    mask: [0xff, 0xff, 0xff, 0xff],
    ignored: [],
    type: "image/x-icon",
    note: "A Windows Cursor signature.",
  },
  {
    pattern: [0x42, 0x4d],
    mask: [0xff, 0xff],
    ignored: [],
    type: "image/bmp",
    note: "The string 'BM', a BMP signature.",
  },
  {
    pattern: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    mask: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    ignored: [],
    type: "image/gif",
    note: "The string 'GIF87a', a GIF signature.",
  },
  {
    pattern: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    mask: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    ignored: [],
    type: "image/gif",
    note: "The string 'GIF89a', a GIF signature.",
  },
  {
    pattern: [
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      0x56, 0x50,
    ],
    mask: [
      0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff,
    ],
    ignored: [],
    type: "image/webp",
    note: "The string 'RIFF' followed by four bytes followed by the string 'WEBPVP'.",
  },
  {
    pattern: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    mask: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    ignored: [],
    type: "image/png",
    note: "An error-checking byte followed by the string 'PNG' followed by CR LF SUB LF, the PNG signature.",
  },
  {
    pattern: [0xff, 0xd8, 0xff],
    mask: [0xff, 0xff, 0xff],
    ignored: [],
    type: "image/jpeg",
    note: "The JPEG Start of Image marker followed by the indicator byte of another marker.",
  },
];

/**
 * Matches buffer against a single pattern item.
 */
function isPatternMatch(buffer: Buffer, item: BitmapPatternItem): boolean {
  const { pattern, mask, ignored } = item;

  if (buffer.length < pattern.length) {
    return false;
  }

  let s = 0;

  // Skip ignored bytes at the beginning
  while (s < buffer.length) {
    if (!ignored.includes(buffer[s])) {
      break;
    }
    s++;
  }

  // Match pattern with mask
  let p = 0;
  while (p < pattern.length) {
    const maskedData = buffer[s] & mask[p];
    if (maskedData !== pattern[p]) {
      return false;
    }
    s++;
    p++;
  }

  return true;
}

/**
 * Detects the MIME type of an image from its buffer using magic bytes.
 *
 * @param buffer - The image file buffer
 * @returns The detected MIME type, or empty string if unknown
 */
export function detectMimeType(buffer: Buffer): string {
  for (const item of BITMAP_PATTERN_TABLE) {
    if (isPatternMatch(buffer, item)) {
      return item.type;
    }
  }
  return UNKNOWN_BITMAP_MIME;
}

/**
 * Gets file extension for a MIME type.
 *
 * @param mimeType - The MIME type
 * @returns The file extension (with dot), or empty string if unknown
 */
export function getExtensionForMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    "image/x-icon": ".ico",
  };
  return mimeToExt[mimeType] || "";
}
