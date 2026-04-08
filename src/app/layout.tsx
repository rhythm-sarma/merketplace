import type { Metadata } from "next";
// Global CSS
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://racksup.in"),
  title: "racksup — Thrift & Preloved Clothing",
  description:
    "Your one stop destination for thrift and preloved clothing. Shop curated men's and women's fashion at unbeatable prices.",
  keywords: ["thrift store india", "preloved clothing", "streetwear india", "buy cheap vintage clothes", "sustainable fashion india", "racksup thrift"],
  openGraph: {
    title: "racksup — Thrift & Preloved Clothing",
    description: "Your one stop destination for thrift and preloved clothing in India. Shop curated fashion at unbeatable prices.",
    url: "https://racksup.in",
    siteName: "Racksup",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Racksup Thrift logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
