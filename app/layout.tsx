import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApniWorld — Spread Kindness",
  description: "Share a kind moment with the world. Upload a photo, write something kind, and brighten someone's day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
