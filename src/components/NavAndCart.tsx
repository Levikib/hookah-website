"use client";
import Navigation from "./Navigation";
import CartDrawer from "./CartDrawer";
import CustomCursor from "./CustomCursor";

export default function NavAndCart() {
  return (
    <>
      <CustomCursor />
      <Navigation />
      <CartDrawer />
    </>
  );
}
