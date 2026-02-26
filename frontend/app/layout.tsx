import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PumpRadar — Know when to buy before the pump",
  description: "We track Solana memecoins in real time and tell you exactly when to get in, before the price explodes. No trading experience needed.",
  metadataBase: new URL("https://pumparadar.vercel.app"),
  openGraph: {
    title: "PumpRadar — Know when to buy before the pump",
    description: "We track Solana memecoins in real time and tell you exactly when to get in, before the price explodes. No trading experience needed.",
    url: "https://pumparadar.vercel.app",
    siteName: "PumpRadar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PumpRadar — Know when to buy before the pump",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PumpRadar — Know when to buy before the pump",
    description: "We track Solana memecoins in real time and tell you exactly when to get in, before the price explodes.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
