export interface RentalModel {
  id: string;
  name: string;
  tagline: string;
  height: string;
  material: string;
  hoseType: string;
  dailyRate: number;
  sessionRate: number;
  salePrice: number;
  priceEstimated: boolean;
  mode: "sale" | "rental" | "both";
  available: number;
  tier: "Standard" | "Premium" | "Luxury" | "Event";
  accentColor: string;
}

// NOTE: prices below are placeholder estimates (priceEstimated: true) pending
// real pot names/specs/pricing from Smokers Vine.
export const RENTAL_MODELS: RentalModel[] = [
  { id: "classic-pot",  name: "Classic Pot",        tagline: "The everyday hookah — reliable and clean.",       height: "65cm", material: "Borosilicate glass + steel",         hoseType: "Single hose", dailyRate: 1500, sessionRate: 1000, salePrice: 6500,  priceEstimated: true, mode: "both",   available: 6, tier: "Standard", accentColor: "#e11d2e" },
  { id: "premium-pot",  name: "Premium Pot",        tagline: "Upgraded build for a smoother, longer session.",  height: "75cm", material: "Reinforced glass + chrome",          hoseType: "Single hose", dailyRate: 2200, sessionRate: 1500, salePrice: 9500,  priceEstimated: true, mode: "both",   available: 4, tier: "Premium",  accentColor: "#f59e0b" },
  { id: "duo-pot",      name: "Duo Pot",            tagline: "Twin hose — built to share.",                     height: "78cm", material: "Borosilicate glass + steel",         hoseType: "Dual hose",   dailyRate: 2800, sessionRate: 1900, salePrice: 11500, priceEstimated: true, mode: "both",   available: 3, tier: "Premium",  accentColor: "#22d3ee" },
  { id: "deluxe-event", name: "Deluxe Event Pot",   tagline: "Party-grade. Built for bigger crowds.",           height: "90cm", material: "Reinforced glass + stainless steel", hoseType: "Quad hose",   dailyRate: 4500, sessionRate: 3200, salePrice: 18500, priceEstimated: true, mode: "rental", available: 2, tier: "Event",    accentColor: "#a855f7" },
];
