---
name: image-upload
description: Upload images to hosting providers and get shareable URLs
  新手引导：输入 `/图床 新手`、「这个怎么用」「第一次用」「能干嘛」时，走 SKILL.md 的〈新手上路〉，不要直接开始干活。
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


## 新手上路（用户不知道该输入什么时，走这里）

**触发**：`/图床 新手`、「这个怎么用」「第一次用」「能干嘛」「带我走一遍」，
以及用户输入了技能名却没有给任何任务的时候。

这个模式的铁律：**不假设、不索取**。用户可能什么都没准备，
不要一上来就问他要文件、要 API key、要具体需求。按下面四步走：

**一、先说清楚这是什么（三句话以内）**

一句话：**把本地图片传到免费图床，直接拿到链接**。
返回可以直接粘进 Markdown 的格式，
写文章插图时不用再自己找图床、复制链接。

**二、给编号选项，让他按回车就能继续**

不要问开放式问题（「你想做什么？」对新手是负担）。给 3 个选项加一个默认：

```
想先看哪个？（直接回车 = 1）
  1. 先讲讲怎么用
  2. 把这张图传上去拿链接
  3. 支持哪些图床
```

**三、直接演示一遍，边做边解释**

选完立刻做给他看，用**示例数据**，不需要他提供任何东西。
每做完一步，加一行「💡 刚才发生了什么」，一句话说明这步的意义。

**四、毕业**

演示完只问一个是非题：「要不要用你自己的图片真跑一遍？」
答是就进正常流程；答否就告诉他随时回来输 `/图床 新手`。


