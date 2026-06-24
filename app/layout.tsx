import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PSD Animator — Anime seu flyer do Photoshop com IA",
  description:
    "Importe seu arquivo PSD com camadas, deixe a IA do Gemini animar cada camada automaticamente e exporte como vídeo MP4 para Stories, Feed ou Landscape.",
  keywords: ["flyer animado", "PSD", "photoshop", "animação", "motion design", "IA", "Gemini", "MP4"],
  openGraph: {
    title: "PSD Animator",
    description: "Anime seu flyer do Photoshop com inteligência artificial",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

