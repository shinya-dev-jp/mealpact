import type { Metadata, Viewport } from "next";
import { MiniKitWrapper } from "@/components/providers/MiniKitWrapper";
import { Toaster } from "@worldcoin/mini-apps-ui-kit-react";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const BASE_URL = "https://mealpact.vercel.app";

const TITLE = "MealPact — AI Calorie Tracker with WLD Commitment";
const DESCRIPTION =
  "Snap a photo, let AI count calories, and commit to healthy habits with WLD. Log 5+ days a week and earn your deposit back.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: TITLE,
    template: "%s | MealPact",
  },
  description: DESCRIPTION,
  keywords: [
    "MealPact",
    "calorie tracker",
    "AI food analysis",
    "WLD commitment",
    "World App",
    "Mini App",
    "healthy habits",
    "meal logging",
  ],
  authors: [{ name: "MealPact" }],
  creator: "MealPact",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    alternateLocale: ["en_US"],
    url: BASE_URL,
    siteName: "MealPact",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.png", sizes: "any", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        {/* Preconnect to Supabase to shave ~100-300ms off the first /api call */}
        <link rel="preconnect" href="https://mlicssmpfdogtippxqtg.supabase.co" />
        <link rel="dns-prefetch" href="https://mlicssmpfdogtippxqtg.supabase.co" />
      </head>
      <body>
        <MiniKitWrapper>
          {children}
          <Toaster />
        </MiniKitWrapper>
      </body>
    </html>
  );
}
