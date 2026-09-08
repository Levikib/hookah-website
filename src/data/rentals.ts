export interface RentalModel {
  id: string;
  name: string;
  tagline: string;
  height: string;
  material: string;
  hoseType: string;
  dailyRate: number;
  sessionRate: number;
  available: number;
  tier: "Standard" | "Premium" | "Luxury" | "Event";
  accentColor: string;
}

export const RENTAL_MODELS: RentalModel[] = [
  { id: "classic",  name: "The Classic",    tagline: "Timeless brass and glass. Never fails.",               height: "70cm", material: "Borosilicate glass + brass",             hoseType: "Single hose", dailyRate: 4500,  sessionRate: 2200,  available: 4, tier: "Standard", accentColor: "#ffd700" },
  { id: "sultan",   name: "The Sultan",     tagline: "Gold-plated. Built for royalty.",                      height: "80cm", material: "Crystal glass + 24k gold-plated brass",   hoseType: "Dual hose",   dailyRate: 9800,  sessionRate: 5200,  available: 1, tier: "Luxury",   accentColor: "#f59e0b" },
  { id: "street",   name: "The Street King",tagline: "Compact. Rugged. Urban energy.",                       height: "55cm", material: "Reinforced glass + powder-coated steel",  hoseType: "Single hose", dailyRate: 6500,  sessionRate: 3800,  available: 6, tier: "Premium",  accentColor: "#ff6b35" },
  { id: "crystal",  name: "The Crystal",    tagline: "Transparent shaft. Watch the smoke dance.",            height: "78cm", material: "Full crystal glass + chrome",              hoseType: "Single hose", dailyRate: 7800,  sessionRate: 4100,  available: 2, tier: "Premium",  accentColor: "#22d3ee" },
  { id: "colossus", name: "The Colossus",   tagline: "Party-grade. Four hoses. One beast.",                  height: "95cm", material: "Borosilicate glass + stainless steel",    hoseType: "Quad hose",   dailyRate: 12500, sessionRate: 7200,  available: 1, tier: "Event",    accentColor: "#a855f7" },
];
