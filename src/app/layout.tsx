import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  name: "MyMidjourney Image Uploader",
  title: "MyMidjourney Image Uploader",
  description:
    "Unlock the creative potential of Midjourney with MyMidjourney API. Connect via RESTful, GraphQL, and more for seamless AI image generation.",
  robots: "follow, index",
  url: "https://mymidjourney.ai",
  type: "website",
  keywords: [
    "Midjourney V6",
    "Midjourney API",
    "Midjourney Alpha",
    "Midjourney Showcase",
    "Midjourney Explore",
    "AI image generation",
    "RESTful integration",
    "GraphQL",
    "unofficial Midjourney API",
    "Sora",
    "Sora API",
    "Sora OpenAI",
    "AI video creation",
    "text to video",
    "OpenAI Sora model",
    "AI-powered videos",
    "creative video app",
    "automated video production",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
