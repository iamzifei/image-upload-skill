---
name: image-upload
description: Upload local images to hosting providers (Catbox, ImgBB, Imgur, etc.) and get shareable URLs. Use for sharing screenshots, uploading images, or getting image links.
---

# Image Upload Skill

Upload local images to various image hosting providers and get shareable URLs in multiple formats.

## Quick Start

Just tell Claude to upload an image:

```
Upload this image: /path/to/screenshot.png
```

Claude will upload it to the default provider (Catbox) and return the URL.

## Usage Examples

### Basic Upload
```
Upload /tmp/screenshot.png
```

### Upload with Custom Name
```
Upload /path/to/image.jpg as "my-screenshot"
```

### Upload to Specific Provider
```
Upload /path/to/photo.png to imgur
```

### Get Specific Format
```
Upload this image and give me the markdown: /path/to/diagram.png
```

## Supported Providers

| Provider | Max Size | Config Required | Best For |
|----------|----------|-----------------|----------|
| **Catbox** | 200MB | No | Default, anonymous, permanent |
| ImgBB | 32MB | API Key | Reliable, good API |
| Imgur | 20MB | Client-ID | Popular, widely supported |
| Freeimage | 64MB | API Key | Large files |
| ImgHippo | 50MB | API Key | Alternative option |
| Weibo | 20MB | Cookies | China users (legacy) |

## Configuration

### No Configuration Required (Default)
Catbox.moe works out of the box without any API keys!

### Optional: Configure Other Providers
Create a `.env` file in your project or `~/.claude/` directory:

```bash
# Use a different default provider
IMAGE_UPLOAD_PROVIDER=imgbb

# Provider API keys
IMGBB_API_KEY=your_key_here
IMGUR_CLIENT_ID=your_client_id
FREEIMAGE_API_KEY=your_key
IMGHIPPO_API_KEY=your_key
```

## Output Formats

The skill returns URLs in multiple formats:

- **URL**: Direct link to the image
- **Markdown**: `![name](url)` for documentation
- **HTML**: `<img src="url">` for web pages
- **BBCode**: `[IMG]url[/IMG]` for forums

## Programmatic Use

```typescript
import { uploadImage } from 'image-upload';

const result = await uploadImage('/path/to/image.png', {
  provider: 'catbox',
  name: 'my-image'
});

console.log(result.url);           // https://files.catbox.moe/abc123.png
console.log(result.formatted.markdown); // ![my-image](https://...)
```

## CLI Usage

```bash
# Install dependencies
cd image-upload && npm install

# Upload an image
npx tsx src/index.ts /path/to/image.png

# With options
npx tsx src/index.ts /path/to/image.png --provider imgur --name screenshot
```

## Error Handling

The skill handles common errors gracefully:
- File not found
- File too large for provider
- Unsupported file type
- Network errors
- Authentication failures

## Notes

- Catbox is the recommended default - no signup, no limits, permanent hosting
- ImgBB and Imgur have daily rate limits but are more established
- Weibo is legacy and not recommended for new projects
- All uploads are anonymous unless you configure user accounts
