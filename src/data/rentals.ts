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
  { id: "classic",  name: "The Classic",    tagline: "Timeless brass and glass. Never fails.",               height: "70cm", material: "Borosilicate glass + brass",             hoseType: "Single hose", dailyRate: 35.00, sessionRate: 18.00, available: 4, tier: "Standard", accentColor: "#ffd700" },
  { id: "phantom",  name: "The Phantom",    tagline: "Matte black everything. Mysterious by design.",        height: "75cm", material: "Smoked glass + black anodized aluminum",  hoseType: "Single hose", dailyRate: 45.00, sessionRate: 24.00, available: 2, tier: "Premium",  accentColor: "#636e72" },
  { id: "sultan",   name: "The Sultan",     tagline: "Gold-plated. Built for royalty.",                      height: "80cm", material: "Crystal glass + 24k gold-plated brass",   hoseType: "Dual hose",   dailyRate: 75.00, sessionRate: 40.00, available: 1, tier: "Luxury",   accentColor: "#ffd700" },
  { id: "street",   name: "The Street King",tagline: "Compact. Rugged. Urban energy.",                       height: "55cm", material: "Reinforced glass + powder-coated steel",  hoseType: "Single hose", dailyRate: 28.00, sessionRate: 15.00, available: 6, tier: "Standard", accentColor: "#ff6b35" },
  { id: "crystal",  name: "The Crystal",    tagline: "Transparent shaft. Watch the smoke dance.",            height: "78cm", material: "Full crystal glass + chrome",              hoseType: "Single hose", dailyRate: 60.00, sessionRate: 32.00, available: 2, tier: "Premium",  accentColor: "#00f5d4" },
  { id: "colossus", name: "The Colossus",   tagline: "Party-grade. Four hoses. One beast.",                  height: "95cm", material: "Borosilicate glass + stainless steel",    hoseType: "Quad hose",   dailyRate: 95.00, sessionRate: 55.00, available: 1, tier: "Event",    accentColor: "#9d4edd" },
];
