import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast";
import { getSiteMeta } from "@/lib/siteMeta";
import { getInitialData } from "@/lib/serverData";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the live content document on the server so the first HTML already
  // carries the admin's logo/reel/content — no flash of the bundled seed.
  const initialData = await getInitialData();
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <StoreProvider initialData={initialData}>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
