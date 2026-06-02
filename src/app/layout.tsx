import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tournex.app";
const DESCRIPTION =
  "Crea torneos de pádel, genera brackets y horarios automáticos, y comparte resultados en vivo. 30 días gratis.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tournex — Organiza tu torneo de pádel",
    template: "%s · Tournex",
  },
  description: DESCRIPTION,
  applicationName: "Tournex",
  authors: [{ name: "Tournex" }],
  keywords: [
    "torneo de pádel",
    "padel",
    "tournament",
    "brackets",
    "padel software",
    "torneo de tenis",
    "round robin",
    "liga semanal",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: "Tournex",
    title: "Tournex — Organiza tu torneo de pádel",
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Tournex — Organiza tu torneo de pádel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tournex — Organiza tu torneo de pádel",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
