"use client";
import dynamic from "next/dynamic";
import HeroSpotlight from "@/components/HeroSpotlight";

// Navigation, CustomCursor, and CartDrawer are already mounted globally via
// NavAndCart in the root layout — do not re-mount them here.
const ServicesSection = dynamic(() => import("@/components/ServicesSection"), { ssr: false });
const FlavourRows      = dynamic(() => import("@/components/FlavourRows"),     { ssr: false });
const RentalsSection   = dynamic(() => import("@/components/RentalsSection"),  { ssr: false });
const Footer           = dynamic(() => import("@/components/Footer"),          { ssr: false });
const BookingModal     = dynamic(() => import("@/components/BookingModal"),    { ssr: false });

export default function Home() {
  return (
    <main style={{ background: "var(--sv-black)", minHeight: "100vh", overflowX: "hidden" }}>
      <HeroSpotlight />

      <ServicesSection />
      <FlavourRows />
      <RentalsSection />

      <Footer />

      <BookingModal />
    </main>
  );
}
