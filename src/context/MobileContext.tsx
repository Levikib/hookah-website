"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const MobileContext = createContext(false);

export function MobileProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    const mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", (e) => setIsMobile(e.matches));
    return () => mq.removeEventListener("change", (e) => setIsMobile(e.matches));
  }, []);
  return <MobileContext.Provider value={isMobile}>{children}</MobileContext.Provider>;
}

export const useIsMobile = () => useContext(MobileContext);
