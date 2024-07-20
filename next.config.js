/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.discordapp.com", "image.imaginepro.ai", "platform.cdn.zhishuyun.com"],
  },
  async rewrites() {
    return [
      {
        source: "/v1/discord/image/upload/url",
        destination: `https://api.imaginepro.ai/api/v1/discord/image/upload/url`,
      },
    ]
  },
}

module.exports = nextConfig
