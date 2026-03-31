import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "图片背景去除工具 | AI Remove Background",
  description: "AI 智能去除图片背景，一键生成透明背景图",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
