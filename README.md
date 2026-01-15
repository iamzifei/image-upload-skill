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

Claude Code skills are installed in the `~/.claude/skills/` directory. Choose one of the following methods:

#### Method 1: Symlink (Recommended)

This method is recommended for development as changes to the repository are immediately reflected.

```bash
# 1. Clone the repository to your preferred location
git clone git@github.com:iamzifei/image-upload-skill.git
cd image-upload-skill

# 2. Install dependencies and build
npm install
npm run build

# 3. Create the skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# 4. Create a symbolic link to the Claude skills folder
ln -s "$(pwd)" ~/.claude/skills/image-upload

# 5. Verify the symlink was created
ls -la ~/.claude/skills/
```

#### Method 2: Clone Directly into Skills Folder

```bash
# 1. Create the skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# 2. Clone directly into the skills folder
git clone git@github.com:iamzifei/image-upload-skill.git ~/.claude/skills/image-upload

# 3. Install dependencies and build
cd ~/.claude/skills/image-upload
npm install
npm run build
```

#### Method 3: Copy Installation

If you don't need git tracking:

```bash
# 1. Clone and build the project
git clone git@github.com:iamzifei/image-upload-skill.git
cd image-upload-skill
npm install
npm run build

# 2. Create the skills directory and copy
mkdir -p ~/.claude/skills
cp -r . ~/.claude/skills/image-upload
```

### Verifying Installation

After installation, verify the skill is properly set up:

```bash
# Check that SKILL.md exists in the skills folder
cat ~/.claude/skills/image-upload/SKILL.md

# The output should show the skill metadata with name: image-upload
```

When you start a new Claude Code session, the skill should be automatically available.

### Configuration (Optional)

Configure providers by creating a `.env` file in the skill directory or in `~/.claude/`:

```bash
# Option 1: In the skill directory
cp ~/.claude/skills/image-upload/.env.example ~/.claude/skills/image-upload/.env

# Option 2: In the Claude config directory (applies to all projects)
cp ~/.claude/skills/image-upload/.env.example ~/.claude/.env
```

Edit the `.env` file to add your API keys:

```bash
# Default provider (catbox works without any config!)
IMAGE_UPLOAD_PROVIDER=catbox

# ImgBB - https://api.imgbb.com/
IMGBB_API_KEY=your_key_here

# Imgur - https://api.imgur.com/oauth2/addclient
IMGUR_CLIENT_ID=your_client_id
```

### Updating the Skill

If you used the symlink method:

```bash
cd /path/to/your/image-upload-skill
git pull
npm install
npm run build
```

If you cloned directly into the skills folder:

```bash
cd ~/.claude/skills/image-upload
git pull
npm install
npm run build
```

### Uninstalling

```bash
# Remove the skill (works for both symlink and direct installation)
rm -rf ~/.claude/skills/image-upload
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
