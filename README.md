# Image Upload Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Claude Code skill for uploading images to various hosting providers and getting shareable URLs.

## Features

- **Zero Configuration**: Works out of the box with Catbox.moe (no API key needed!)
- **Multiple Providers**: Support for 6 image hosting services
- **Multiple Formats**: Get URLs in plain, Markdown, HTML, and BBCode formats
- **CLI & Programmatic**: Use from command line or import as a module

## Provider Comparison

| Provider | Max Size | Auth Required | Daily Limit | China Access | Stability |
|----------|----------|---------------|-------------|--------------|-----------|
| **Catbox** | 200MB | None | Unlimited | OK | Good |
| ImgBB | 32MB | API Key | ~Unlimited | Good | Good |
| Imgur | 20MB | Client-ID | ~1,250 | Blocked | Excellent |
| Freeimage | 64MB | API Key | Unknown | Good | Medium |
| ImgHippo | 50MB | API Key | Unknown | Unknown | Medium |
| Weibo | 20MB | Cookies | Unknown | Excellent | Poor |

### Recommendation

- **Default**: Use **Catbox** - no configuration, anonymous, permanent storage
- **For production**: Consider **ImgBB** with API key for reliability
- **In China**: **Catbox** or **Weibo** (if you have an account)
- **Avoid**: **Imgur** is blocked in China

## Installation

### As a Claude Code Skill

1. Clone the repository:
   ```bash
   git clone git@github.com:iamzifei/image-upload-skill.git
   cd image-upload-skill
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. (Optional) Configure providers in `.env`:
   ```bash
   IMAGE_UPLOAD_PROVIDER=catbox
   IMGBB_API_KEY=your_key_here
   ```

### Standalone CLI

```bash
git clone git@github.com:iamzifei/image-upload-skill.git
cd image-upload-skill
npm install
npm run build
```

## Usage

### With Claude

Just ask Claude to upload an image:

```
Upload this screenshot: /path/to/image.png
```

```
Upload /tmp/photo.jpg to imgur and give me the markdown
```

### CLI

```bash
# Basic upload (uses Catbox by default)
npx tsx src/index.ts /path/to/image.png

# Upload to specific provider
npx tsx src/index.ts /path/to/image.png --provider imgur

# Upload with custom name
npx tsx src/index.ts /path/to/image.png --name my-screenshot

# List available providers
npx tsx src/index.ts --list

# Help
npx tsx src/index.ts --help
```

### Programmatic

```typescript
import { uploadImage, formatResult } from './src/index.js';

// Simple upload
const result = await uploadImage('/path/to/image.png');
console.log(result.url);

// With options
const result = await uploadImage('/path/to/image.png', {
  provider: 'imgbb',
  name: 'my-image'
});

// Get formatted output
console.log(result.formatted.markdown);  // ![my-image](https://...)
console.log(result.formatted.html);      // <img src="https://..." alt="my-image">
```

## Configuration

### Environment Variables

Create a `.env` file (see `.env.example`):

```bash
# Default provider (catbox works without any config!)
IMAGE_UPLOAD_PROVIDER=catbox

# Optional: Catbox user hash for file management
CATBOX_USERHASH=

# ImgBB - https://api.imgbb.com/
IMGBB_API_KEY=

# Imgur - https://api.imgur.com/oauth2/addclient
IMGUR_CLIENT_ID=

# Freeimage.host - https://freeimage.host/page/api
FREEIMAGE_API_KEY=

# ImgHippo - https://www.imghippo.com/
IMGHIPPO_API_KEY=

# Weibo (legacy) - export cookies from browser
WEIBO_COOKIES=
```

### Getting API Keys

| Provider | Where to Get |
|----------|--------------|
| Catbox | No key needed! |
| ImgBB | https://api.imgbb.com/ |
| Imgur | https://api.imgur.com/oauth2/addclient |
| Freeimage | https://freeimage.host/page/api |
| ImgHippo | https://www.imghippo.com/ |
| Weibo | Export cookies from browser |

## Output Format

Successful uploads return:

```typescript
{
  id: "abc123",           // Provider-specific ID
  url: "https://...",     // Direct image URL
  viewerUrl: "https://...", // Viewer page (if available)
  deleteUrl: "https://...", // Deletion URL (if available)
  formatted: {
    url: "https://...",
    markdown: "![name](https://...)",
    html: '<img src="https://..." alt="name">',
    bbcode: "[IMG]https://...[/IMG]"
  }
}
```

## Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)
- ICO (.ico) - Catbox only

## Error Handling

The skill provides clear error messages:

- **File not found**: Check the path
- **File too large**: Try a different provider with higher limits
- **Unsupported type**: Convert to a supported format
- **Auth failure**: Check your API key / credentials
- **Network error**: Check your connection

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- /path/to/image.png

# Build
npm run build

# Run tests
npm test
```

## Repository

- **GitHub**: https://github.com/iamzifei/image-upload-skill

## License

MIT

## Credits

Inspired by [Weibo-Picture-Store](https://github.com/nicexxx/Weibo-Picture-Store) Chrome extension.
