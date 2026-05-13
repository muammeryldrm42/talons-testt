import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Talons Docs",
  description: "Documentation for Open Talons — open-source AI agent framework",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
