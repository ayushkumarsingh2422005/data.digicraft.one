import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://data.digicraft.one"),
  title: {
    default: "DigiCraft Public Data Browser",
    template: "%s | DigiCraft Data",
  },
  description:
    "Browse DigiCraft public assets (images, videos, PDFs) with a clean, navigable folder interface.",
  keywords: [
    "DigiCraft",
    "public files",
    "assets",
    "images",
    "videos",
    "PDF",
    "browser",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://data.digicraft.one/",
    siteName: "DigiCraft Data",
    title: "DigiCraft Public Data Browser",
    description:
      "Explore and access DigiCraft public assets with previews and downloads.",
    images: [
      {
        url: "/Logo/Main.png",
        width: 1200,
        height: 630,
        alt: "DigiCraft Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@digicraft",
    creator: "@digicraft",
    title: "DigiCraft Public Data Browser",
    description:
      "Explore and access DigiCraft public assets with previews and downloads.",
    images: ["/Logo/Main.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
