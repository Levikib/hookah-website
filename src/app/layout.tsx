import type { Metadata } from "next";
import { Bebas_Neue, Barlow_Condensed, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import NavAndCart from "@/components/NavAndCart";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const barlow = Barlow_Condensed({ weight: ["400","600","700"], subsets: ["latin"], variable: "--font-barlow", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = Space_Mono({ weight: ["400","700"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Hookah Sessions — Rent · Book · Flavours",
  description: "Premium hookah rental, session booking, and shisha flavours. The session starts here.",
  keywords: "hookah, shisha, rental, booking, flavours, sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${barlow.variable} ${inter.variable} ${mono.variable}`}>
      <body className="antialiased">
        <NavAndCart />
        {children}
      </body>
    </html>
  );
}
