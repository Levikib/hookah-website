import type { Metadata, Viewport } from "next";
import { Sora, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import NavAndCart from "@/components/NavAndCart";
import { MobileProvider } from "@/context/MobileContext";

const sora = Sora({ weight: ["300","400","600","700","800"], subsets: ["latin"], variable: "--font-sora", display: "swap" });
const grotesk = Space_Grotesk({ weight: ["300","400","500","600","700"], subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = Space_Mono({ weight: ["400","700"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Hookah Sessions — Rent · Book · Flavours",
  description: "Premium hookah rental, session booking, and shisha flavours. The session starts here.",
  keywords: "hookah, shisha, rental, booking, flavours, sessions",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${grotesk.variable} ${mono.variable}`}>
      <body className="antialiased">
        <MobileProvider>
        <NavAndCart />
        {children}
        </MobileProvider>
      </body>
    </html>
  );
}
