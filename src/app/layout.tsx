import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Tournex — Organiza tu torneo de pádel",
  description:
    "Crea torneos de pádel, genera brackets y horarios automáticos, y comparte resultados en vivo.",
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
