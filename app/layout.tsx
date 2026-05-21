import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { getSiteMeta } from "@/lib/siteMeta";

// Render dynamically so the title/favicon always reflect the latest admin
// settings (read from R2 per request) without needing a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, logo, tagline } = await getSiteMeta();
  return {
    title: siteName,
    description:
      tagline ||
      "Cinematic photography and film for modern brands — automotive, fashion, architecture and more.",
    icons: logo ? { icon: logo, apple: logo } : undefined,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
