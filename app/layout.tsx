import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "QR Code Machine - Free QR Code Generator | Website, WiFi, Contact",
    template: "%s | QR Code Machine"
  },
  description: "Free QR code generator. Create QR codes for websites, WiFi networks, and contact cards instantly. Download high-resolution QR codes. No signup required.",
  keywords: [
    "QR code generator",
    "free QR code",
    "QR code maker",
    "QR code creator",
    "website QR code",
    "WiFi QR code",
    "contact QR code",
    "vCard QR code",
    "QR code download",
    "online QR code generator",
    "QR code tool",
    "generate QR code",
    "QR code for website",
    "QR code for WiFi",
    "QR code for contact"
  ],
  authors: [{ name: "Creative Club" }],
  creator: "Creative Club",
  publisher: "Creative Club",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://qrcode-machine.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://qrcode-machine.com",
    siteName: "QR Code Machine",
    title: "QR Code Machine - Free QR Code Generator",
    description: "Free QR code generator. Create QR codes for websites, WiFi networks, and contact cards instantly. Download high-resolution QR codes.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "QR Code Machine - Free QR Code Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Code Machine - Free QR Code Generator",
    description: "Free QR code generator. Create QR codes for websites, WiFi networks, and contact cards instantly.",
    images: ["/og.png"],
    creator: "@creativeclub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "tools",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "QR Code Machine",
              "description": "Free QR code generator. Create QR codes for websites, WiFi networks, and contact cards instantly.",
              "url": "https://qrcode-machine.com",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "ratingCount": "1"
              },
              "featureList": [
                "Generate QR codes for websites",
                "Create WiFi QR codes",
                "Generate contact card QR codes",
                "Download high-resolution QR codes",
                "Free to use",
                "No signup required"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
