export interface Flavour {
  id: number;
  name: string;
  category: string;
  intensity: "Mild" | "Medium" | "Strong";
  notes: string[];
  price: number;
  priceEstimated: boolean;
  stock: number;
  color: string;
  emoji: string;
  description: string;
  pairsWith: string[];
}

// NOTE: prices below are placeholder estimates (priceEstimated: true) pending
// real pricing from Smokers Vine — flag visibly in the UI until confirmed.
export const FLAVOURS: Flavour[] = [
  // ── Mint Family ──────────────────────────────────────────────────────────
  { id: 1,  name: "Mint",              category: "Mint Family", intensity: "Strong", notes: ["Spearmint", "Cool", "Sharp"],        price: 1200, priceEstimated: true, stock: 40, color: "#1abc9c", emoji: "🌿", description: "Pure, ice-cold spearmint. The clean classic that clears the palate every time.", pairsWith: ["Gum Mint", "Frozen Lemon Mint"] },
  { id: 2,  name: "Gum Mint",          category: "Mint Family", intensity: "Medium", notes: ["Bubblegum", "Mint", "Sweet"],        price: 1300, priceEstimated: true, stock: 35, color: "#ff9ff3", emoji: "🫧", description: "Bubblegum sweetness cooled off with a fresh mint finish. Playful and smooth.", pairsWith: ["Mint", "Blueberry Mint"] },
  { id: 3,  name: "Blueberry Mint",    category: "Mint Family", intensity: "Medium", notes: ["Blueberry", "Mint", "Juicy"],        price: 1300, priceEstimated: true, stock: 38, color: "#3498db", emoji: "🫐", description: "Wild blueberry laid over a cooling mint bed. A Smokers Vine signature pairing.", pairsWith: ["Mint", "Frozen Lemon Mint"] },
  { id: 4,  name: "Orange Mint",       category: "Mint Family", intensity: "Medium", notes: ["Orange", "Mint", "Citrus"],          price: 1300, priceEstimated: true, stock: 30, color: "#fd9644", emoji: "🍊", description: "Bright citrus zest with a cool mint chaser. Wakes the whole session up.", pairsWith: ["Watermelon Mint", "Kiwi Mint"] },
  { id: 5,  name: "Frozen Lemon Mint", category: "Mint Family", intensity: "Strong", notes: ["Lemon", "Menthol", "Ice"],           price: 1300, priceEstimated: true, stock: 26, color: "#f1c40f", emoji: "🍋", description: "Sharp lemon zest frozen solid with menthol ice. Not for the faint of heart.", pairsWith: ["Mint", "Watermelon Mint"] },
  { id: 6,  name: "Watermelon Mint",   category: "Mint Family", intensity: "Mild",   notes: ["Watermelon", "Mint", "Sweet"],       price: 1300, priceEstimated: true, stock: 34, color: "#2ecc71", emoji: "🍉", description: "Juicy watermelon soaked in a cool mint mist — the go-to warm-night blend.", pairsWith: ["Kiwi Mint", "Orange Mint"] },
  { id: 7,  name: "Kiwi Mint",         category: "Mint Family", intensity: "Medium", notes: ["Kiwi", "Mint", "Tart"],              price: 1300, priceEstimated: true, stock: 22, color: "#55efc4", emoji: "🥝", description: "Tart kiwi brightened by a fresh mint breeze. Exotic and refreshing.", pairsWith: ["Watermelon Mint", "Orange Mint"] },

  // ── Signature Blends ─────────────────────────────────────────────────────
  { id: 8,  name: "Lady Killer",       category: "Signature",   intensity: "Medium", notes: ["Sweet", "Smooth", "House Blend"],    price: 1500, priceEstimated: true, stock: 20, color: "#e879f9", emoji: "💋", description: "Smokers Vine's most requested house special. Smooth, seductive, and endlessly sessionable.", pairsWith: ["Love 69", "Mocha Latte"] },
  { id: 9,  name: "Love 69",           category: "Signature",   intensity: "Medium", notes: ["Fruity", "Sweet", "House Blend"],    price: 1500, priceEstimated: true, stock: 18, color: "#f43f5e", emoji: "❤️‍🔥", description: "A bold house mix built for the party crowd. Sweet, punchy, and made to be shared.", pairsWith: ["Lady Killer", "Double Apple"] },
  { id: 10, name: "Mocha Latte",       category: "Signature",   intensity: "Medium", notes: ["Coffee", "Milk", "Sweet"],           price: 1600, priceEstimated: true, stock: 15, color: "#6c5ce7", emoji: "☕", description: "Rich mocha and cream — a dessert blend for the late-night crowd.", pairsWith: ["Lady Killer", "Double Apple"] },

  // ── Classic ──────────────────────────────────────────────────────────────
  { id: 11, name: "Double Apple",      category: "Classic",     intensity: "Medium", notes: ["Apple", "Anise", "Sweet"],           price: 1300, priceEstimated: true, stock: 42, color: "#e74c3c", emoji: "🍎", description: "The original hookah staple. Crisp apple sweetness with a subtle anise backbone.", pairsWith: ["Al Sultan Mint", "Love 69"] },
  { id: 12, name: "Al Sultan",         category: "Classic",     intensity: "Strong", notes: ["Spice", "Tobacco", "Bold"],          price: 1400, priceEstimated: true, stock: 24, color: "#c0392b", emoji: "👑", description: "A bold, spiced classic blend built for those who like it strong.", pairsWith: ["Al Sultan Mint", "Double Apple"] },
  { id: 13, name: "Al Sultan Mint",    category: "Classic",     intensity: "Strong", notes: ["Spice", "Mint", "Bold"],             price: 1400, priceEstimated: true, stock: 22, color: "#e67e22", emoji: "🔥", description: "Al Sultan's spiced boldness, cooled with a strong mint finish.", pairsWith: ["Al Sultan", "Double Apple"] },

  // ── Coconut ──────────────────────────────────────────────────────────────
  { id: 14, name: "Coconut",           category: "Tropical",    intensity: "Mild",   notes: ["Coconut", "Creamy", "Smooth"],       price: 1300, priceEstimated: true, stock: 28, color: "#dfe6e9", emoji: "🥥", description: "Toasted coconut, smooth and creamy — a laid-back beach-day blend.", pairsWith: ["Mocha Latte", "Watermelon Mint"] },
];

export const CATEGORIES = [
  "All", "Mint Family", "Signature", "Classic", "Tropical",
] as const;

export type Category = typeof CATEGORIES[number];

export function getStockStatus(stock: number) {
  if (stock === 0) return "out";
  if (stock < 5)  return "critical";
  if (stock <= 15) return "low";
  return "normal";
}
