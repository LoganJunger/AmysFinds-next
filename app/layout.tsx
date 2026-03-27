import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amy's Finds — Vermont Antiques",
  description:
    "Curated antique furniture from Vermont. AI-powered inventory management for unique vintage pieces.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-text-primary">{children}</body>
    </html>
  );
}
