import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "LUMEN — Photography & Film Studio",
  description:
    "Cinematic photography and film for modern brands — automotive, fashion, architecture and more.",
};

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
